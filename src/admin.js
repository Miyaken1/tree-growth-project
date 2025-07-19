// Admin page specific functionality
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form')
  const adminPanel = document.getElementById('admin-panel')
  const loginBtn = document.getElementById('login-btn')
  const passwordInput = document.getElementById('password')
  const saveConfigBtn = document.getElementById('save-config')
  const addImageUrlBtn = document.getElementById('add-image-url')
  const imageUrlsContainer = document.getElementById('image-urls-container')

  let imageUrlCount = 0

  // Hash password using SHA-256
  async function hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Login functionality
  loginBtn.addEventListener('click', async function() {
    const password = passwordInput.value
    if (!password) {
      alert('パスワードを入力してください')
      return
    }

    try {
      const hashedPassword = await hashPassword(password)
      console.log('Hashed password:', hashedPassword)
      
      // Mock authentication - in real implementation, this would call the API
      // For demo purposes, accept any password
      loginForm.classList.add('hidden')
      adminPanel.classList.remove('hidden')
      
      // Load existing configuration
      loadConfiguration()
    } catch (error) {
      console.error('Login error:', error)
      alert('ログインに失敗しました')
    }
  })

  // Add image URL input
  addImageUrlBtn.addEventListener('click', function() {
    addImageUrlInput()
  })

  function addImageUrlInput(value = '') {
    const div = document.createElement('div')
    div.className = 'flex items-center space-x-2'
    div.innerHTML = `
      <input type="url" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com/image.jpg" value="${value}">
      <button type="button" class="bg-red-600 text-white py-2 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500" onclick="this.parentElement.remove()">削除</button>
    `
    imageUrlsContainer.appendChild(div)
    imageUrlCount++
  }

  // Load configuration
  function loadConfiguration() {
    // Mock configuration data
    const mockConfig = {
      thresholds: [10, 100],
      period: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      imageUrls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ]
    }

    // Populate form fields
    document.getElementById('threshold-min').value = mockConfig.thresholds[0]
    document.getElementById('threshold-max').value = mockConfig.thresholds[1]
    document.getElementById('period-start').value = mockConfig.period.start
    document.getElementById('period-end').value = mockConfig.period.end

    // Add image URL inputs
    mockConfig.imageUrls.forEach(url => {
      addImageUrlInput(url)
    })
  }

  // Save configuration
  saveConfigBtn.addEventListener('click', async function() {
    const config = {
      thresholds: [
        parseInt(document.getElementById('threshold-min').value),
        parseInt(document.getElementById('threshold-max').value)
      ],
      period: {
        start: document.getElementById('period-start').value,
        end: document.getElementById('period-end').value
      },
      imageUrls: Array.from(imageUrlsContainer.querySelectorAll('input[type="url"]'))
        .map(input => input.value)
        .filter(url => url.trim() !== '')
    }

    try {
      console.log('Saving configuration:', config)
      // In real implementation, this would POST to the API
      alert('設定が保存されました')
    } catch (error) {
      console.error('Save error:', error)
      alert('設定の保存に失敗しました')
    }
  })

  // Allow Enter key to trigger login
  passwordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      loginBtn.click()
    }
  })
})

