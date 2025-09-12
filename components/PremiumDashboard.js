// Premium Dashboard Component
// Full access to LUXIA CRM and NOTORIUS Smart Contracts
// Enhanced with Real-time Event Clocking System

class PremiumDashboard {
  constructor(userAccess) {
    this.userAccess = userAccess
    this.currentPlatform = 'luxia'
    this.sessionId = null
    this.realTimeConnection = null
    this.clockingClient = null
    this.dashboardData = {
      today: {},
      recent_events: [],
      top_sources: [],
      hot_leads: []
    }
    this.init()
  }

  init() {
    this.initializeClockingClient()
    this.createDashboard()
    this.attachEventListeners()
    this.startSession()
    this.setupRealTimeUpdates()
    this.loadInitialData()
  }

  initializeClockingClient() {
    // Initialize event clocking client for real-time data
    const apiUrl = window.location.origin
    this.clockingClient = new window.EventClockingClient(apiUrl)
  }

  createDashboard() {
    const dashboardHTML = `
      <div id="premium-dashboard" class="premium-dashboard">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="user-info">
            <div class="avatar premium">
              <span class="avatar-text">BM</span>
              <span class="premium-badge">✨</span>
            </div>
            <div class="user-details">
              <h3>Panel Premium</h3>
              <p>Plan: <span class="plan-name">${this.userAccess.plan?.toUpperCase() || 'PREMIUM'}</span></p>
            </div>
          </div>
          
          <div class="dashboard-controls">
            <div class="platform-tabs">
              <button class="tab-btn active" data-platform="luxia" ${!this.userAccess.luxiaAccess ? 'disabled' : ''}>
                💼 LUXIA CRM
              </button>
              <button class="tab-btn" data-platform="notorius" ${!this.userAccess.notoriusAccess ? 'disabled' : ''}>
                ⚡ NOTORIUS
              </button>
              <button class="tab-btn" data-platform="clocking">
                📊 Event Monitor
              </button>
            </div>
            
            <div class="real-time-status">
              <span class="status-dot" id="realtime-status"></span>
              <span id="realtime-text">Conectando...</span>
            </div>
            
            <button class="btn btn-outline logout-btn">
              🚪 Salir
            </button>
          </div>
        </div>

        <!-- Real-time Event Clocking Platform -->
        <div id="clocking-platform" class="platform-content">
          <div class="platform-header">
            <h2>📊 Event Monitor - Sistema de Clocking en Tiempo Real</h2>
            <div class="real-time-indicator">
              <span class="status-dot active"></span>
              <span>Monitoreo en vivo</span>
            </div>
          </div>
          
          <!-- Real-time Stats Dashboard -->
          <div class="clocking-stats-grid">
            <div class="clocking-stat-card">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value" id="events-today">-</div>
                <div class="stat-label">Eventos Hoy</div>
                <div class="stat-trend" id="events-trend">Cargando...</div>
              </div>
            </div>
            
            <div class="clocking-stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value" id="leads-today">-</div>
                <div class="stat-label">Leads Capturados</div>
                <div class="stat-trend" id="leads-trend">Cargando...</div>
              </div>
            </div>
            
            <div class="clocking-stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-value" id="sales-today">-</div>
                <div class="stat-label">Ventas Completadas</div>
                <div class="stat-trend" id="sales-trend">Cargando...</div>
              </div>
            </div>
            
            <div class="clocking-stat-card">
              <div class="stat-icon">💎</div>
              <div class="stat-content">
                <div class="stat-value" id="revenue-today">-</div>
                <div class="stat-label">Ingresos Hoy</div>
                <div class="stat-trend" id="revenue-trend">Cargando...</div>
              </div>
            </div>
          </div>

          <!-- Event Sources Performance -->
          <div class="clocking-section">
            <h3>🔗 Rendimiento por Fuente</h3>
            <div class="sources-grid" id="sources-grid">
              <div class="loading-placeholder">Cargando fuentes...</div>
            </div>
          </div>

          <!-- Hot Leads Real-time -->
          <div class="clocking-section">
            <h3>🔥 Leads Calientes (Tiempo Real)</h3>
            <div class="hot-leads-container">
              <div class="leads-list" id="hot-leads-list">
                <div class="loading-placeholder">Cargando leads...</div>
              </div>
            </div>
          </div>

          <!-- Recent Events Stream -->
          <div class="clocking-section">
            <h3>⚡ Stream de Eventos Recientes</h3>
            <div class="events-stream">
              <div class="stream-controls">
                <button class="btn btn-sm" id="pause-stream">⏸️ Pausar</button>
                <button class="btn btn-sm" id="clear-stream">🗑️ Limpiar</button>
                <select id="event-filter" class="form-control sm">
                  <option value="">Todos los eventos</option>
                  <option value="lead_captured">Leads capturados</option>
                  <option value="payment_completed">Pagos completados</option>
                  <option value="bot_interaction">Interacciones bot</option>
                  <option value="demo_scheduled">Demos agendadas</option>
                </select>
              </div>
              <div class="events-list" id="events-stream">
                <div class="stream-placeholder">
                  <div class="pulse-indicator"></div>
                  <span>Esperando eventos en tiempo real...</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LUXIA CRM Full Platform (existing) -->
        <div id="luxia-platform" class="platform-content active">
          <div class="platform-header">
            <h2>💼 LUXIA CRM - Centro de Control Completo</h2>
            <div class="real-time-indicator">
              <span class="status-dot active"></span>
              <span>En tiempo real</span>
            </div>
          </div>
          
          <!-- Advanced Stats -->
          <div class="stats-grid premium">
            <div class="stat-card premium">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value" id="luxia-total-clients">1,247</div>
                <div class="stat-label">Clientes Totales</div>
                <div class="stat-trend positive">+23 este mes</div>
              </div>
              <div class="stat-chart">
                <div class="mini-chart" data-values="45,52,48,61,55,67,59,73,68,72,71,79"></div>
              </div>
            </div>
            
            <div class="stat-card premium">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-value" id="luxia-aum">€4.2M</div>
                <div class="stat-label">AUM Total</div>
                <div class="stat-trend positive">+18.5% MTD</div>
              </div>
              <div class="stat-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 78%"></div>
                </div>
                <span class="progress-text">78% objetivo anual</span>
              </div>
            </div>
            
            <div class="stat-card premium">
              <div class="stat-icon">🎯</div>
              <div class="stat-content">
                <div class="stat-value" id="luxia-conversion">94.2%</div>
                <div class="stat-label">Tasa Conversión</div>
                <div class="stat-trend positive">+5.7% vs mes anterior</div>
              </div>
            </div>
            
            <div class="stat-card premium">
              <div class="stat-icon">🤖</div>
              <div class="stat-content">
                <div class="stat-value" id="luxia-ai-signals">847</div>
                <div class="stat-label">Señales IA Hoy</div>
                <div class="stat-trend positive">127 oportunidades</div>
              </div>
            </div>
          </div>
          
          <!-- Advanced CRM Tools -->
          <div class="crm-tools">
            <div class="tool-section">
              <h3>📊 Panel de Análisis Avanzado</h3>
              <div class="analysis-panel">
                <div class="market-overview">
                  <h4>Vista del Mercado</h4>
                  <div class="market-indicators">
                    <div class="indicator bullish">
                      <span class="indicator-name">S&P 500</span>
                      <span class="indicator-value">+2.4%</span>
                      <span class="indicator-signal">🟢 COMPRA</span>
                    </div>
                    <div class="indicator bearish">
                      <span class="indicator-name">EUR/USD</span>
                      <span class="indicator-value">-0.8%</span>
                      <span class="indicator-signal">🔴 VENTA</span>
                    </div>
                    <div class="indicator neutral">
                      <span class="indicator-name">BTC</span>
                      <span class="indicator-value">+0.2%</span>
                      <span class="indicator-signal">🟡 HOLD</span>
                    </div>
                  </div>
                </div>
                
                <div class="ai-recommendations">
                  <h4>🤖 Recomendaciones IA</h4>
                  <div class="recommendations-list">
                    <div class="recommendation hot">
                      <div class="rec-icon">🔥</div>
                      <div class="rec-content">
                        <strong>NVDA - Oportunidad Caliente</strong>
                        <p>Entrada recomendada: $890 | Target: $1,050 | ROI: +18%</p>
                        <span class="rec-confidence">Confianza: 94%</span>
                      </div>
                      <button class="btn btn-sm btn-gold">Ejecutar</button>
                    </div>
                    
                    <div class="recommendation">
                      <div class="rec-icon">⚡</div>
                      <div class="rec-content">
                        <strong>Portfolio Rebalance</strong>
                        <p>Diversificación recomendada en sector tech</p>
                        <span class="rec-confidence">Confianza: 87%</span>
                      </div>
                      <button class="btn btn-sm btn-outline">Revisar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="tool-section">
              <h3>📈 Pipeline Avanzado</h3>
              <div class="advanced-pipeline" id="crm-pipeline">
                <div class="pipeline-stage">
                  <h4>Prospectos Fríos (<span id="cold-leads-count">24</span>)</h4>
                  <div class="leads-list" id="cold-leads">
                    <div class="lead-item">
                      <div class="lead-avatar">CM</div>
                      <div class="lead-info">
                        <strong>Carlos Mendoza</strong>
                        <span>€125K portfolio</span>
                      </div>
                      <div class="lead-actions">
                        <button class="action-btn">📞</button>
                        <button class="action-btn">📧</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="pipeline-stage">
                  <h4>Calientes (<span id="hot-leads-count">12</span>)</h4>
                  <div class="leads-list" id="hot-leads-crm">
                    <div class="lead-item hot">
                      <div class="lead-avatar">AR</div>
                      <div class="lead-info">
                        <strong>Ana Rodriguez</strong>
                        <span>€340K portfolio</span>
                      </div>
                      <div class="urgency-indicator">🔥</div>
                    </div>
                  </div>
                </div>
                
                <div class="pipeline-stage">
                  <h4>Cierre (<span id="closing-leads-count">8</span>)</h4>
                  <div class="leads-list" id="closing-leads">
                    <div class="lead-item closing">
                      <div class="lead-avatar">RS</div>
                      <div class="lead-info">
                        <strong>Roberto Silva</strong>
                        <span>€890K portfolio</span>
                      </div>
                      <div class="close-probability">95%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTORIUS Smart Contracts Full Platform (existing) -->
        <div id="notorius-platform" class="platform-content">
          <div class="platform-header">
            <h2>⚡ NOTORIUS - Smart Contracts Engine</h2>
            <div class="blockchain-status">
              <span class="status-dot active"></span>
              <span>Blockchain Sincronizada</span>
            </div>
          </div>
          
          <!-- Blockchain Stats -->
          <div class="blockchain-stats">
            <div class="stat-card blockchain">
              <div class="stat-icon">⚡</div>
              <div class="stat-content">
                <div class="stat-value">127</div>
                <div class="stat-label">Contratos Activos</div>
              </div>
            </div>
            
            <div class="stat-card blockchain">
              <div class="stat-icon">💎</div>
              <div class="stat-content">
                <div class="stat-value">€2.1M</div>
                <div class="stat-label">TVL Total</div>
              </div>
            </div>
            
            <div class="stat-card blockchain">
              <div class="stat-icon">🔄</div>
              <div class="stat-content">
                <div class="stat-value">8,947</div>
                <div class="stat-label">Transacciones</div>
              </div>
            </div>
            
            <div class="stat-card blockchain">
              <div class="stat-icon">🛡️</div>
              <div class="stat-content">
                <div class="stat-value">99.9%</div>
                <div class="stat-label">Uptime</div>
              </div>
            </div>
          </div>
          
          <!-- Smart Contracts Management -->
          <div class="contracts-management">
            <div class="section-header">
              <h3>📋 Gestión de Contratos</h3>
              <button class="btn btn-gold">➕ Nuevo Contrato</button>
            </div>
            
            <div class="contracts-table">
              <div class="table-header">
                <span>Contrato</span>
                <span>Valor</span>
                <span>Estado</span>
                <span>Yield</span>
                <span>Acciones</span>
              </div>
              
              <div class="contract-row">
                <div class="contract-info">
                  <div class="contract-icon">🏠</div>
                  <div>
                    <strong>Propiedad Barcelona #001</strong>
                    <span class="contract-address">0x742d35Cc6Fc3a3Ab...5f3a</span>
                  </div>
                </div>
                <span class="contract-value">€450,000</span>
                <span class="status-badge active">EJECUTANDO</span>
                <span class="yield positive">+12.5% APY</span>
                <div class="contract-actions">
                  <button class="action-btn">👁️</button>
                  <button class="action-btn">⚙️</button>
                  <button class="action-btn">🔄</button>
                </div>
              </div>
              
              <div class="contract-row">
                <div class="contract-info">
                  <div class="contract-icon">💎</div>
                  <div>
                    <strong>DeFi Pool Alpha</strong>
                    <span class="contract-address">0x891a2Bc8Ef3d1Ab...7c2b</span>
                  </div>
                </div>
                <span class="contract-value">€125,750</span>
                <span class="status-badge pending">PENDIENTE</span>
                <span class="yield">--</span>
                <div class="contract-actions">
                  <button class="action-btn primary">▶️</button>
                  <button class="action-btn">⚙️</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Tokenization Tools -->
          <div class="tokenization-tools">
            <h3>🔒 Herramientas de Tokenización</h3>
            <div class="tokenization-panel">
              <div class="token-creation">
                <h4>Crear Nuevo Token</h4>
                <form class="token-form">
                  <div class="form-group">
                    <label>Activo Base</label>
                    <select name="assetType">
                      <option>Propiedad Inmobiliaria</option>
                      <option>Portfolio de Inversión</option>
                      <option>Commodity</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Valor Total</label>
                    <input type="number" placeholder="€100,000" />
                  </div>
                  <div class="form-group">
                    <label>Supply de Tokens</label>
                    <input type="number" placeholder="1000" />
                  </div>
                  <button type="submit" class="btn btn-gold">🚀 Tokenizar Activo</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    
    const targetElement = document.querySelector('#main-content')
    if (targetElement) {
      targetElement.innerHTML = dashboardHTML
    } else {
      document.body.insertAdjacentHTML('beforeend', dashboardHTML)
    }
  }

  attachEventListeners() {
    // Platform tabs
    const tabButtons = document.querySelectorAll('.tab-btn')
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!btn.disabled) {
          this.switchPlatform(btn.dataset.platform)
        }
      })
    })
    
    // Logout button
    document.querySelector('.logout-btn').addEventListener('click', () => {
      this.logout()
    })
    
    // Real-time event stream controls
    const pauseBtn = document.getElementById('pause-stream')
    const clearBtn = document.getElementById('clear-stream')
    const filterSelect = document.getElementById('event-filter')

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.toggleEventStream())
    }
    
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearEventStream())
    }

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => this.filterEvents(e.target.value))
    }
    
    // Contract actions
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        console.log('Contract action clicked')
      })
    })
    
    // AI recommendations
    document.querySelectorAll('.recommendation button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        this.handleRecommendation(btn)
      })
    })
  }

  switchPlatform(platform) {
    this.currentPlatform = platform
    
    // Update tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.platform === platform)
    })
    
    // Update content
    document.querySelectorAll('.platform-content').forEach(content => {
      content.classList.toggle('active', content.id === `${platform}-platform`)
    })
    
    // Load platform-specific data
    if (platform === 'clocking') {
      this.loadClockingData()
    }
    
    // Track session
    this.trackPlatformSwitch(platform)
  }

  async setupRealTimeUpdates() {
    try {
      // Setup real-time connection for events
      this.realTimeConnection = this.clockingClient.createRealTimeConnection((eventData) => {
        this.handleRealTimeEvent(eventData)
      })

      // Update status indicator
      this.updateRealTimeStatus('connected', 'Conectado en tiempo real')

      console.log('✅ Real-time connection established')
    } catch (error) {
      console.error('❌ Error setting up real-time updates:', error)
      this.updateRealTimeStatus('error', 'Error de conexión')
    }
  }

  updateRealTimeStatus(status, text) {
    const statusDot = document.getElementById('realtime-status')
    const statusText = document.getElementById('realtime-text')
    
    if (statusDot && statusText) {
      statusDot.className = `status-dot ${status}`
      statusText.textContent = text
    }
  }

  handleRealTimeEvent(eventData) {
    console.log('📡 Real-time event received:', eventData)

    if (eventData.type === 'new_event') {
      // Update dashboard stats
      this.updateDashboardStats()
      
      // Add to event stream
      this.addEventToStream(eventData)
      
      // Update hot leads if it's a high-score lead
      if (eventData.event_type === 'lead_qualified' || eventData.event_type === 'lead_hot') {
        this.updateHotLeads()
      }

      // Show notification for important events
      if (['payment_completed', 'lead_hot', 'demo_scheduled'].includes(eventData.event_type)) {
        this.showEventNotification(eventData)
      }
    }

    if (eventData.type === 'stats_update') {
      this.updateRealTimeStats(eventData)
    }
  }

  async loadInitialData() {
    try {
      await this.updateDashboardStats()
      await this.updateHotLeads()
      await this.loadRecentEvents()
      await this.updateSourcesPerformance()
    } catch (error) {
      console.error('Error loading initial dashboard data:', error)
    }
  }

  async loadClockingData() {
    // Load clocking platform specific data
    await this.loadInitialData()
  }

  async updateDashboardStats() {
    try {
      const dashboard = await this.clockingClient.getDashboard()
      
      if (dashboard.success && dashboard.today) {
        const today = dashboard.today
        
        document.getElementById('events-today').textContent = today.total_events || 0
        document.getElementById('leads-today').textContent = today.leads_today || 0
        document.getElementById('sales-today').textContent = today.sales_today || 0
        document.getElementById('revenue-today').textContent = `€${(today.revenue_today || 0).toLocaleString()}`
        
        // Update trends (simplified)
        document.getElementById('events-trend').textContent = '+' + (today.total_events || 0) + ' hoy'
        document.getElementById('leads-trend').textContent = '+' + (today.leads_today || 0) + ' hoy'
        document.getElementById('sales-trend').textContent = '+' + (today.sales_today || 0) + ' hoy'
        document.getElementById('revenue-trend').textContent = '+€' + (today.revenue_today || 0).toLocaleString() + ' hoy'
      }
    } catch (error) {
      console.error('Error updating dashboard stats:', error)
    }
  }

  async updateHotLeads() {
    try {
      const dashboard = await this.clockingClient.getDashboard()
      
      if (dashboard.success && dashboard.hot_leads) {
        const hotLeadsList = document.getElementById('hot-leads-list')
        if (!hotLeadsList) return

        hotLeadsList.innerHTML = dashboard.hot_leads.map(lead => `
          <div class="hot-lead-item">
            <div class="lead-avatar">${lead.customer_name?.substring(0, 2)?.toUpperCase() || 'XX'}</div>
            <div class="lead-info">
              <strong>${lead.customer_name || 'Anónimo'}</strong>
              <span class="lead-email">${lead.customer_email}</span>
              <span class="lead-score">Score: ${lead.score}/100</span>
            </div>
            <div class="lead-status ${lead.lead_status}">
              ${lead.lead_status.toUpperCase()}
            </div>
            <div class="lead-actions">
              <button class="action-btn" onclick="this.contactLead('${lead.customer_email}')">📞</button>
              <button class="action-btn" onclick="this.emailLead('${lead.customer_email}')">📧</button>
            </div>
          </div>
        `).join('')
      }
    } catch (error) {
      console.error('Error updating hot leads:', error)
    }
  }

  async loadRecentEvents() {
    try {
      const events = await this.clockingClient.getRecentEvents({ limit: 10 })
      
      if (events.success && events.events) {
        const eventsStream = document.getElementById('events-stream')
        if (!eventsStream) return

        eventsStream.innerHTML = events.events.map(event => this.createEventItem(event)).join('')
      }
    } catch (error) {
      console.error('Error loading recent events:', error)
    }
  }

  async updateSourcesPerformance() {
    try {
      const dashboard = await this.clockingClient.getDashboard()
      
      if (dashboard.success && dashboard.top_sources) {
        const sourcesGrid = document.getElementById('sources-grid')
        if (!sourcesGrid) return

        sourcesGrid.innerHTML = dashboard.top_sources.map(source => `
          <div class="source-card">
            <div class="source-header">
              <h4>${source.source_name}</h4>
              <span class="source-events">${source.events} eventos</span>
            </div>
            <div class="source-metrics">
              <div class="metric">
                <span class="metric-label">Leads</span>
                <span class="metric-value">${source.leads}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Ventas</span>
                <span class="metric-value">${source.sales}</span>
              </div>
            </div>
          </div>
        `).join('')
      }
    } catch (error) {
      console.error('Error updating sources performance:', error)
    }
  }

  createEventItem(event) {
    const timeAgo = this.timeAgo(new Date(event.event_timestamp))
    const eventIcon = this.getEventIcon(event.event_type)
    const eventValue = event.event_value ? `€${event.event_value.toLocaleString()}` : ''

    return `
      <div class="event-item ${event.event_type}" data-event-type="${event.event_type}">
        <div class="event-icon">${eventIcon}</div>
        <div class="event-content">
          <div class="event-header">
            <strong>${this.getEventTitle(event.event_type)}</strong>
            <span class="event-time">${timeAgo}</span>
          </div>
          <div class="event-details">
            ${event.customer_name || event.customer_email || 'Cliente anónimo'}
            ${eventValue ? ` - ${eventValue}` : ''}
          </div>
          <div class="event-source">${event.source_name}</div>
        </div>
      </div>
    `
  }

  addEventToStream(eventData) {
    const eventsStream = document.getElementById('events-stream')
    if (!eventsStream) return

    // Remove placeholder if exists
    const placeholder = eventsStream.querySelector('.stream-placeholder')
    if (placeholder) {
      placeholder.remove()
    }

    // Create new event item
    const eventItem = document.createElement('div')
    eventItem.className = `event-item ${eventData.event_type} new-event`
    eventItem.dataset.eventType = eventData.event_type
    
    const eventIcon = this.getEventIcon(eventData.event_type)
    const eventValue = eventData.event_value ? `€${eventData.event_value.toLocaleString()}` : ''

    eventItem.innerHTML = `
      <div class="event-icon">${eventIcon}</div>
      <div class="event-content">
        <div class="event-header">
          <strong>${this.getEventTitle(eventData.event_type)}</strong>
          <span class="event-time">Ahora</span>
        </div>
        <div class="event-details">
          ${eventData.customer_name || eventData.customer_email || 'Cliente anónimo'}
          ${eventValue ? ` - ${eventValue}` : ''}
        </div>
        <div class="event-source">${eventData.source_name}</div>
      </div>
    `

    // Add to top of stream
    eventsStream.insertBefore(eventItem, eventsStream.firstChild)

    // Remove old events (keep last 20)
    const eventItems = eventsStream.querySelectorAll('.event-item')
    if (eventItems.length > 20) {
      eventItems[eventItems.length - 1].remove()
    }

    // Animate new event
    setTimeout(() => eventItem.classList.remove('new-event'), 3000)
  }

  getEventIcon(eventType) {
    const icons = {
      'lead_captured': '👥',
      'lead_qualified': '⭐',
      'lead_hot': '🔥',
      'demo_scheduled': '📅',
      'payment_initiated': '💳',
      'payment_completed': '💰',
      'bot_interaction': '🤖',
      'whatsapp_message': '💬',
      'email_opened': '📧',
      'email_clicked': '🔗'
    }
    return icons[eventType] || '📊'
  }

  getEventTitle(eventType) {
    const titles = {
      'lead_captured': 'Lead Capturado',
      'lead_qualified': 'Lead Calificado',
      'lead_hot': 'Lead Caliente',
      'demo_scheduled': 'Demo Agendada',
      'payment_initiated': 'Pago Iniciado',
      'payment_completed': 'Pago Completado',
      'bot_interaction': 'Interacción Bot',
      'whatsapp_message': 'Mensaje WhatsApp',
      'email_opened': 'Email Abierto',
      'email_clicked': 'Email Clickeado'
    }
    return titles[eventType] || 'Evento'
  }

  showEventNotification(eventData) {
    const notification = document.createElement('div')
    notification.className = 'event-notification'
    notification.innerHTML = `
      <div class="notification-icon">${this.getEventIcon(eventData.event_type)}</div>
      <div class="notification-content">
        <strong>${this.getEventTitle(eventData.event_type)}</strong>
        <span>${eventData.customer_name || eventData.customer_email}</span>
      </div>
    `

    document.body.appendChild(notification)

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('fade-out')
      setTimeout(() => notification.remove(), 300)
    }, 5000)
  }

  toggleEventStream() {
    const pauseBtn = document.getElementById('pause-stream')
    if (this.realTimeConnection) {
      // Implementation depends on the real-time connection type
      pauseBtn.textContent = pauseBtn.textContent.includes('Pausar') ? '▶️ Reanudar' : '⏸️ Pausar'
    }
  }

  clearEventStream() {
    const eventsStream = document.getElementById('events-stream')
    if (eventsStream) {
      eventsStream.innerHTML = `
        <div class="stream-placeholder">
          <div class="pulse-indicator"></div>
          <span>Stream limpiado - esperando eventos...</span>
        </div>
      `
    }
  }

  filterEvents(eventType) {
    const eventItems = document.querySelectorAll('.event-item')
    eventItems.forEach(item => {
      if (!eventType || item.dataset.eventType === eventType) {
        item.style.display = 'flex'
      } else {
        item.style.display = 'none'
      }
    })
  }

  timeAgo(date) {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Ahora'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  updateRealTimeStats(statsData) {
    // Update real-time statistics from server-sent events
    if (statsData.recent_events) {
      const indicator = document.querySelector('.real-time-indicator .status-dot')
      if (indicator) {
        indicator.classList.add('pulse')
        setTimeout(() => indicator.classList.remove('pulse'), 1000)
      }
    }
  }

  async startSession() {
    try {
      const sessionData = {
        ip: await this.getClientIP(),
        platform: this.currentPlatform
      }
      
      const { data, error } = await window.MelanoDb.startSession(
        this.userAccess.subscription.user_id,
        this.currentPlatform,
        sessionData
      )
      
      if (data) {
        this.sessionId = data.id
      }
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  async trackPlatformSwitch(platform) {
    console.log(`Platform switched to: ${platform}`)
  }

  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch {
      return null
    }
  }

  handleRecommendation(button) {
    const recommendation = button.closest('.recommendation')
    const action = button.textContent.trim()
    
    if (action === 'Ejecutar') {
      this.showExecutionModal(recommendation)
    } else {
      console.log('Show recommendation details')
    }
  }

  showExecutionModal(recommendation) {
    const modal = document.createElement('div')
    modal.className = 'execution-modal'
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <h3>⚡ Ejecutar Recomendación</h3>
        <p>¿Estás seguro de ejecutar esta operación?</p>
        <div class="modal-actions">
          <button class="btn btn-outline cancel">Cancelar</button>
          <button class="btn btn-gold confirm">Ejecutar</button>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    
    modal.querySelector('.cancel').addEventListener('click', () => modal.remove())
    modal.querySelector('.confirm').addEventListener('click', () => {
      this.executeRecommendation(recommendation)
      modal.remove()
    })
  }

  async executeRecommendation(recommendation) {
    const toast = document.createElement('div')
    toast.className = 'success-toast'
    toast.textContent = '✅ Recomendación ejecutada con éxito'
    document.body.appendChild(toast)
    
    setTimeout(() => toast.remove(), 3000)
  }

  async logout() {
    try {
      if (this.realTimeConnection) {
        this.realTimeConnection.close()
      }

      if (this.sessionId) {
        const startTime = new Date(this.sessionStartTime || Date.now() - 30*60*1000)
        const duration = Math.floor((Date.now() - startTime) / 60000)
        await window.MelanoDb.endSession(this.sessionId, duration)
      }
      
      await window.MelanoAuth.signOut()
      window.location.reload()
      
    } catch (error) {
      console.error('Logout error:', error)
      window.location.reload()
    }
  }
}

export default PremiumDashboard