// Authentication Modal Component
// Handles login, signup, and password reset

class AuthModal {
  constructor() {
    this.isOpen = false
    this.mode = 'login' // 'login', 'signup', 'reset'
    this.currentUser = null
    this.init()
  }

  init() {
    this.createModal()
    this.attachEventListeners()
    this.checkAuthState()
  }

  createModal() {
    const modalHTML = `
      <div id="auth-modal" class="auth-modal hidden">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <button class="modal-close" aria-label="Cerrar modal">×</button>
          
          <!-- Login Form -->
          <div id="login-form" class="auth-form">
            <div class="form-header">
              <h2>🚀 Acceder a MELANO INC</h2>
              <p>Ingresa a tu cuenta para acceder a LUXIA CRM y NOTORIUS</p>
            </div>
            
            <form id="login-form-element">
              <div class="field">
                <label for="login-email">Email</label>
                <input id="login-email" name="email" type="email" required placeholder="tu.email@ejemplo.com" />
              </div>
              
              <div class="field">
                <label for="login-password">Contraseña</label>
                <input id="login-password" name="password" type="password" required placeholder="Tu contraseña" />
              </div>
              
              <button type="submit" class="btn btn-gold btn-large">
                🔑 Iniciar Sesión
              </button>
              
              <div id="login-error" class="auth-error hidden"></div>
            </form>
            
            <div class="auth-footer">
              <button class="link-btn" data-switch="signup">¿No tienes cuenta? Regístrate</button>
              <button class="link-btn" data-switch="reset">¿Olvidaste tu contraseña?</button>
            </div>
          </div>
          
          <!-- Signup Form -->
          <div id="signup-form" class="auth-form hidden">
            <div class="form-header">
              <h2>✨ Únete a MELANO INC</h2>
              <p>Crea tu cuenta y accede a nuestras plataformas de inversión</p>
            </div>
            
            <form id="signup-form-element">
              <div class="grid">
                <div class="field">
                  <label for="signup-name">Nombre completo</label>
                  <input id="signup-name" name="fullName" type="text" required placeholder="Tu nombre completo" />
                </div>
                
                <div class="field">
                  <label for="signup-phone">Teléfono</label>
                  <input id="signup-phone" name="phone" type="tel" placeholder="+54 9 11 1234 5678" />
                </div>
              </div>
              
              <div class="field">
                <label for="signup-email">Email</label>
                <input id="signup-email" name="email" type="email" required placeholder="tu.email@ejemplo.com" />
              </div>
              
              <div class="field">
                <label for="signup-password">Contraseña</label>
                <input id="signup-password" name="password" type="password" required placeholder="Mínimo 6 caracteres" />
              </div>
              
              <div class="field">
                <label for="signup-profile">Perfil de inversor</label>
                <select id="signup-profile" name="investorProfile" required>
                  <option value="">Selecciona tu perfil</option>
                  <option value="beginner">🌱 Principiante</option>
                  <option value="intermediate">📈 Intermedio</option>
                  <option value="advanced">🏆 Avanzado</option>
                  <option value="professional">💼 Profesional</option>
                </select>
              </div>
              
              <button type="submit" class="btn btn-gold btn-large">
                🚀 Crear Cuenta
              </button>
              
              <div id="signup-error" class="auth-error hidden"></div>
              <div id="signup-success" class="auth-success hidden"></div>
            </form>
            
            <div class="auth-footer">
              <button class="link-btn" data-switch="login">¿Ya tienes cuenta? Iniciar sesión</button>
            </div>
          </div>
          
          <!-- Password Reset Form -->
          <div id="reset-form" class="auth-form hidden">
            <div class="form-header">
              <h2>🔄 Restablecer Contraseña</h2>
              <p>Te enviaremos un enlace para restablecer tu contraseña</p>
            </div>
            
            <form id="reset-form-element">
              <div class="field">
                <label for="reset-email">Email</label>
                <input id="reset-email" name="email" type="email" required placeholder="tu.email@ejemplo.com" />
              </div>
              
              <button type="submit" class="btn btn-gold btn-large">
                📧 Enviar Enlace
              </button>
              
              <div id="reset-error" class="auth-error hidden"></div>
              <div id="reset-success" class="auth-success hidden"></div>
            </form>
            
            <div class="auth-footer">
              <button class="link-btn" data-switch="login">Volver al inicio de sesión</button>
            </div>
          </div>
        </div>
      </div>
    `
    
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    this.modal = document.getElementById('auth-modal')
  }

  attachEventListeners() {
    // Modal controls
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close())
    this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close())
    
    // Form switching
    this.modal.querySelectorAll('[data-switch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        this.switchForm(btn.dataset.switch)
      })
    })
    
    // Form submissions
    this.modal.querySelector('#login-form-element').addEventListener('submit', (e) => this.handleLogin(e))
    this.modal.querySelector('#signup-form-element').addEventListener('submit', (e) => this.handleSignup(e))
    this.modal.querySelector('#reset-form-element').addEventListener('submit', (e) => this.handleReset(e))
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  }

  async checkAuthState() {
    const { user } = await window.MelanoAuth.getUser()
    this.currentUser = user
    this.updateAuthUI()
  }

  updateAuthUI() {
    const authButtons = document.querySelectorAll('.auth-trigger')
    const userButtons = document.querySelectorAll('.user-menu')
    
    if (this.currentUser) {
      authButtons.forEach(btn => btn.style.display = 'none')
      userButtons.forEach(btn => btn.style.display = 'block')
    } else {
      authButtons.forEach(btn => btn.style.display = 'block')
      userButtons.forEach(btn => btn.style.display = 'none')
    }
  }

  open(mode = 'login') {
    this.mode = mode
    this.switchForm(mode)
    this.modal.classList.remove('hidden')
    this.isOpen = true
    document.body.style.overflow = 'hidden'
  }

  close() {
    this.modal.classList.add('hidden')
    this.isOpen = false
    document.body.style.overflow = ''
    this.clearMessages()
  }

  switchForm(mode) {
    this.mode = mode
    this.modal.querySelectorAll('.auth-form').forEach(form => {
      form.classList.add('hidden')
    })
    this.modal.querySelector(`#${mode}-form`).classList.remove('hidden')
    this.clearMessages()
  }

  clearMessages() {
    this.modal.querySelectorAll('.auth-error, .auth-success').forEach(el => {
      el.classList.add('hidden')
      el.textContent = ''
    })
  }

  showError(formType, message) {
    const errorEl = this.modal.querySelector(`#${formType}-error`)
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
  }

  showSuccess(formType, message) {
    const successEl = this.modal.querySelector(`#${formType}-success`)
    successEl.textContent = message
    successEl.classList.remove('hidden')
  }

  async handleLogin(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')
    const password = formData.get('password')
    
    try {
      const btn = e.target.querySelector('button[type="submit"]')
      const originalText = btn.textContent
      btn.textContent = 'Iniciando sesión...'
      btn.disabled = true
      
      const { data, error } = await window.MelanoAuth.signIn(email, password)
      
      if (error) {
        throw new Error(error.message)
      }
      
      this.currentUser = data.user
      this.updateAuthUI()
      this.close()
      
      // Redirect to dashboard or show success
      this.showWelcomeMessage()
      
    } catch (error) {
      console.error('Login error:', error)
      this.showError('login', 'Error al iniciar sesión: ' + error.message)
    } finally {
      const btn = e.target.querySelector('button[type="submit"]')
      btn.textContent = '🔑 Iniciar Sesión'
      btn.disabled = false
    }
  }

  async handleSignup(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const userData = Object.fromEntries(formData.entries())
    
    try {
      const btn = e.target.querySelector('button[type="submit"]')
      const originalText = btn.textContent
      btn.textContent = 'Creando cuenta...'
      btn.disabled = true
      
      const { data, error } = await window.MelanoAuth.signUp(
        userData.email, 
        userData.password, 
        userData
      )
      
      if (error) {
        throw new Error(error.message)
      }
      
      this.showSuccess('signup', '¡Cuenta creada! Revisa tu email para verificar tu cuenta.')
      
      // Switch to login after 3 seconds
      setTimeout(() => {
        this.switchForm('login')
      }, 3000)
      
    } catch (error) {
      console.error('Signup error:', error)
      this.showError('signup', 'Error al crear cuenta: ' + error.message)
    } finally {
      const btn = e.target.querySelector('button[type="submit"]')
      btn.textContent = '🚀 Crear Cuenta'
      btn.disabled = false
    }
  }

  async handleReset(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const email = formData.get('email')
    
    try {
      const btn = e.target.querySelector('button[type="submit"]')
      btn.textContent = 'Enviando...'
      btn.disabled = true
      
      // Implement password reset logic here
      this.showSuccess('reset', 'Si el email existe, recibirás un enlace para restablecer tu contraseña.')
      
    } catch (error) {
      console.error('Reset error:', error)
      this.showError('reset', 'Error al enviar enlace: ' + error.message)
    } finally {
      const btn = e.target.querySelector('button[type="submit"]')
      btn.textContent = '📧 Enviar Enlace'
      btn.disabled = false
    }
  }

  showWelcomeMessage() {
    // Show a success toast or redirect
    const toast = document.createElement('div')
    toast.className = 'success-toast'
    toast.textContent = '¡Bienvenido a MELANO INC! 🚀'
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }
}

export default AuthModal