// Premium Dashboard Component
// Full access to LUXIA CRM and NOTORIUS Smart Contracts

class PremiumDashboard {
  constructor(userAccess) {
    this.userAccess = userAccess
    this.currentPlatform = 'luxia'
    this.sessionId = null
    this.init()
  }

  init() {
    this.createDashboard()
    this.attachEventListeners()
    this.startSession()
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
            </div>
            
            <button class="btn btn-outline logout-btn">
              🚪 Salir
            </button>
          </div>
        </div>

        <!-- LUXIA CRM Full Platform -->
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
                <div class="stat-value">1,247</div>
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
                <div class="stat-value">€4.2M</div>
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
                <div class="stat-value">94.2%</div>
                <div class="stat-label">Tasa Conversión</div>
                <div class="stat-trend positive">+5.7% vs mes anterior</div>
              </div>
            </div>
            
            <div class="stat-card premium">
              <div class="stat-icon">🤖</div>
              <div class="stat-content">
                <div class="stat-value">847</div>
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
              <div class="advanced-pipeline">
                <div class="pipeline-stage">
                  <h4>Prospectos Fríos (24)</h4>
                  <div class="leads-list">
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
                  <h4>Calientes (12)</h4>
                  <div class="leads-list">
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
                  <h4>Cierre (8)</h4>
                  <div class="leads-list">
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

        <!-- NOTORIUS Smart Contracts Full Platform -->
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
    
    // Contract actions
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        // Handle contract actions
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
    
    // Track session
    this.trackPlatformSwitch(platform)
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
    // Track platform usage for analytics
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
      // Show execution modal
      this.showExecutionModal(recommendation)
    } else {
      // Show details
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
      // Execute recommendation
      this.executeRecommendation(recommendation)
      modal.remove()
    })
  }

  async executeRecommendation(recommendation) {
    // Simulate execution
    const toast = document.createElement('div')
    toast.className = 'success-toast'
    toast.textContent = '✅ Recomendación ejecutada con éxito'
    document.body.appendChild(toast)
    
    setTimeout(() => toast.remove(), 3000)
  }

  async logout() {
    try {
      // End session
      if (this.sessionId) {
        const startTime = new Date(this.sessionStartTime || Date.now() - 30*60*1000)
        const duration = Math.floor((Date.now() - startTime) / 60000)
        await window.MelanoDb.endSession(this.sessionId, duration)
      }
      
      await window.MelanoAuth.signOut()
      
      // Reload page to reset state
      window.location.reload()
      
    } catch (error) {
      console.error('Logout error:', error)
      window.location.reload()
    }
  }
}

export default PremiumDashboard