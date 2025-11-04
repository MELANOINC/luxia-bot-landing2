require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const { pool } = require('./db/pool');
const { tableExists, validateRequiredFields } = require('./db/utils');
const { errorHandler, asyncHandler, requestTimeout, rateLimit } = require('./middleware');
const Web3Service = require('./services/web3Service');
const app = express();
const port = Number(process.env.PORT || 5678);
const host = process.env.HOST || '127.0.0.1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestTimeout(30000)); // 30 second timeout for all requests
app.use(rateLimit({ windowMs: 60000, max: 100 })); // 100 requests per minute
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-aqui',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuración Passport Google OAuth (solo si están configuradas las credenciales)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://${host}:${port}/auth/google/callback`
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  console.log('✅ Google OAuth configured');
} else {
  console.log('⚠️ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

app.get('/', (req, res) => res.send(`Hola desde ${port}`));

// Ruta de prueba de conexión a BD
app.get('/db-ping', asyncHandler(async (req, res) => {
	const r = await pool.query('select 1 as ok');
	res.json({ ok: true, result: r.rows[0] });
}));

// Endpoint de ejemplo: lista elementos desde public.items (si existe)
app.get('/items', asyncHandler(async (req, res) => {
	const exists = await tableExists('items');
	if (!exists) {
		return res.status(404).json({
			ok: false,
			error: "La tabla public.items no existe",
			howToCreate: "CREATE TABLE public.items (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());"
		});
	}
	const { rows } = await pool.query('select * from public.items order by 1 desc limit 20');
	res.json({ ok: true, count: rows.length, items: rows });
}));

// Endpoint para insertar nuevo item
app.post('/items', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['name']);
	if (validationError) {
		return res.status(400).json(validationError);
	}

	const exists = await tableExists('items');
	if (!exists) {
		return res.status(404).json({
			ok: false,
			error: "La tabla public.items no existe",
			howToCreate: "CREATE TABLE public.items (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());"
		});
	}

	const { name } = req.body;
	const { rows } = await pool.query(
		'insert into public.items (name) values ($1) returning *',
		[name]
	);
	res.json({ ok: true, item: rows[0] });
}));

// Google OAuth routes (solo si OAuth está configurado)
app.get('/auth/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ 
      ok: false, 
      error: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' 
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

app.get('/auth/google/callback', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.redirect('/?error=oauth_not_configured');
  }
  passport.authenticate('google', { failureRedirect: '/' })(req, res, () => {
    res.redirect('/profile');
  });
});

app.get('/profile', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ 
      ok: false, 
      error: 'Google OAuth not configured' 
    });
  }
  
  if (!req.user) {
    return res.redirect('/auth/google');
  }
  res.json({
    ok: true,
    user: {
      id: req.user.id,
      displayName: req.user.displayName,
      email: req.user.emails ? req.user.emails[0].value : null
    }
  });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Webhook endpoint para N8N
app.post('/webhook/n8n', asyncHandler(async (req, res) => {
	console.log('📨 Webhook N8N recibido:', req.body);
	
	const data = req.body;
	
	if (data && Object.keys(data).length > 0) {
		res.json({ 
			ok: true, 
			message: 'Webhook procesado correctamente',
			received: data 
		});
	} else {
		res.json({ ok: true, message: 'Webhook vacío recibido' });
	}
}));

app.get('/webhook/n8n', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Webhook N8N endpoint activo',
    method: 'GET (para testing)',
    postEndpoint: '/webhook/n8n'
  });
});

// Initialize Web3 Service
const web3Service = new Web3Service();

// Web3 and Smart Contract endpoints
app.get('/web3/status', asyncHandler(async (req, res) => {
	const isInitialized = web3Service.provider !== null;
	if (!isInitialized) {
		return res.json({ 
			ok: false, 
			message: 'Web3 service not initialized',
			provider: null,
			contracts: null
		});
	}

	const blockNumber = await web3Service.getBlockNumber();
	const signerAddress = web3Service.signer ? web3Service.signer.address : null;
	
	res.json({
		ok: true,
		message: 'Web3 service active',
		blockNumber,
		signer: signerAddress,
		contracts: {
			luxia: web3Service.contractAddresses.luxia,
			notorious: web3Service.contractAddresses.notorious
		}
	});
}));

// LUXIA Token endpoints
app.get('/tokens/luxia/info', asyncHandler(async (req, res) => {
	const info = await web3Service.getLuxiaTokenInfo();
	res.json({ ok: true, token: info });
}));

app.get('/tokens/luxia/balance/:address', asyncHandler(async (req, res) => {
	const { address } = req.params;
	const balance = await web3Service.getLuxiaBalance(address);
	res.json({ ok: true, address, balance });
}));

app.post('/tokens/luxia/transfer', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['to', 'amount']);
	if (validationError) {
		return res.status(400).json(validationError);
	}
	
	const { to, amount } = req.body;
	const result = await web3Service.transferLuxia(to, amount);
	res.json({ ok: true, transaction: result });
}));

app.post('/tokens/luxia/mint', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['to', 'amount']);
	if (validationError) {
		return res.status(400).json(validationError);
	}
	
	const { to, amount } = req.body;
	const result = await web3Service.mintLuxia(to, amount);
	res.json({ ok: true, transaction: result });
}));

// NOTORIOUS Token endpoints
app.get('/tokens/notorious/info', asyncHandler(async (req, res) => {
	const info = await web3Service.getNotoriusTokenInfo();
	res.json({ ok: true, token: info });
}));

app.get('/tokens/notorious/balance/:address', asyncHandler(async (req, res) => {
	const { address } = req.params;
	const balance = await web3Service.getNotoriusBalance(address);
	res.json({ ok: true, address, balance });
}));

app.post('/tokens/notorious/transfer', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['to', 'amount']);
	if (validationError) {
		return res.status(400).json(validationError);
	}
	
	const { to, amount } = req.body;
	const result = await web3Service.transferNotorious(to, amount);
	res.json({ ok: true, transaction: result });
}));

app.post('/tokens/notorious/set-fee', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['feePercent']);
	if (validationError) {
		return res.status(400).json(validationError);
	}
	
	const { feePercent } = req.body;
	const result = await web3Service.setNotoriusFee(feePercent);
	res.json({ ok: true, transaction: result });
}));

app.post('/tokens/notorious/blacklist', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['address']);
	if (validationError) {
		return res.status(400).json(validationError);
	}
	
	const { address } = req.body;
	const result = await web3Service.blacklistAddress(address);
	res.json({ ok: true, transaction: result });
}));

app.post('/tokens/notorious/pause', asyncHandler(async (req, res) => {
	const result = await web3Service.pauseNotorious();
	res.json({ ok: true, transaction: result });
}));

// Smart contract management endpoints
app.post('/web3/initialize', asyncHandler(async (req, res) => {
	const { providerUrl } = req.body;
	const url = providerUrl || 'http://localhost:8545';
	
	const success = await web3Service.initialize(url);
	if (success) {
		res.json({ ok: true, message: 'Web3 service initialized', provider: url });
	} else {
		res.status(500).json({ ok: false, error: 'Failed to initialize Web3 service' });
	}
}));

app.post('/web3/load-contracts', asyncHandler(async (req, res) => {
	const validationError = validateRequiredFields(req.body, ['luxiaAddress', 'notoriusAddress']);
	if (validationError) {
		return res.status(400).json(validationError);
	}
	
	const { luxiaAddress, notoriusAddress } = req.body;
	const success = await web3Service.loadContracts(luxiaAddress, notoriusAddress);
	if (success) {
		res.json({ 
			ok: true, 
			message: 'Contracts loaded successfully',
			contracts: {
				luxia: luxiaAddress,
				notorious: notoriusAddress
			}
		});
	} else {
		res.status(500).json({ ok: false, error: 'Failed to load contracts' });
	}
}));

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(port, host, () => console.log(`Servidor en http://${host}:${port}`));

async function gracefulShutdown(signal) {
  console.log(`\n${signal} signal received: starting graceful shutdown`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('HTTP server closed');
    
    // Close database pool
    try {
      await pool.end();
      console.log('Database pool closed');
    } catch (err) {
      console.error('Error closing database pool:', err);
    }
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));