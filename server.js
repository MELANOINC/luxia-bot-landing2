require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { pool } = require('./db/pool');
const app = express();
const port = Number(process.env.PORT || 5678);
const host = process.env.HOST || '127.0.0.1';

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-secreto-aqui',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuración Passport Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://${host}:${port}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    // Aquí puedes guardar el usuario en BD si quieres
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/', (req, res) => res.send(`Hola desde ${port}`));

// Ruta de prueba de conexión a BD
app.get('/db-ping', async (req, res) => {
	try {
		const r = await pool.query('select 1 as ok');
		res.json({ ok: true, result: r.rows[0] });
	} catch (e) {
		res.status(500).json({ ok: false, error: e.message });
	}
});

// Endpoint de ejemplo: lista elementos desde public.items (si existe)
app.get('/items', async (req, res) => {
	try {
		// Verificar existencia de la tabla
		const check = await pool.query(
			"select to_regclass('public.items') as tbl"
		);
		if (!check.rows[0] || !check.rows[0].tbl) {
			return res.status(404).json({
				ok: false,
				error: "La tabla public.items no existe",
				howToCreate: "CREATE TABLE public.items (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());"
			});
		}
		const { rows } = await pool.query('select * from public.items order by 1 desc limit 20');
		res.json({ ok: true, count: rows.length, items: rows });
	} catch (e) {
		res.status(500).json({ ok: false, error: e.message });
	}
});

// Endpoint para insertar nuevo item
app.post('/items', async (req, res) => {
	try {
		// Verificar existencia de la tabla
		const check = await pool.query(
			"select to_regclass('public.items') as tbl"
		);
		if (!check.rows[0] || !check.rows[0].tbl) {
			return res.status(404).json({
				ok: false,
				error: "La tabla public.items no existe",
				howToCreate: "CREATE TABLE public.items (id uuid primary key default gen_random_uuid(), name text not null, created_at timestamptz default now());"
			});
		}
		// Validación básica
		const { name } = req.body;
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return res.status(400).json({
				ok: false,
				error: "Campo 'name' requerido y no vacío"
			});
		}
		// Insertar y devolver el registro creado
		const { rows } = await pool.query(
			'insert into public.items (name) values ($1) returning *',
			[name.trim()]
		);
		res.status(201).json({ ok: true, item: rows[0] });
	} catch (e) {
		res.status(500).json({ ok: false, error: e.message });
	}
});

// Rutas de autenticación Google
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Autenticación exitosa
    res.redirect('/profile');
  }
);

// Ruta protegida de ejemplo
app.get('/profile', (req, res) => {
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

// Logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Webhook endpoint para N8N
app.post('/webhook/n8n', async (req, res) => {
  try {
    // Verificar token de N8N
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.N8N_WEBHOOK_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5M2YzOWUwYy01MTQ2LTRhNTEtYmMzMy1hYWM0MmNhODJkZDMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU3OTI1MzI1LCJleHAiOjE3NjA1MDA4MDB9.dfNaflEIfMgDKQrgHP8tVcC0YhXXUfXawRx3sZLJF_Q';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autorización requerido' });
    }
    
    const token = authHeader.substring(7); // Remover 'Bearer '
    
    if (token !== expectedToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Procesar datos del webhook
    const webhookData = req.body;
    console.log('Webhook N8N recibido:', webhookData);
    
    // Aquí puedes procesar los datos según tus necesidades
    // Por ejemplo, guardar en BD, enviar email, etc.
    
    // Respuesta de éxito
    res.json({ 
      ok: true, 
      message: 'Webhook procesado correctamente',
      received: webhookData 
    });
    
  } catch (error) {
    console.error('Error en webhook N8N:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, host, () => console.log(`Servidor en http://${host}:${port}`));
