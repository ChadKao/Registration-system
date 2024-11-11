const jwt = require('jsonwebtoken')

const getGoogleOneTapPage = (req, res, next) => {
  try {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Google One Tap Login Test</title>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      <div id="g_id_onload" data-client_id="${process.env.GOOGLE_CLIENT_ID}" data-login_uri="${process.env.BASE_URL}/api/patients/auth/google/callback">
      </div>
    </head>
    <body>
      <h1>Google One Tap Login Test</h1>
      <p>此頁面將測試 Google One Tap 的登入功能</p>
    </body>
    </html>
  `)
  } catch (error) {
    next(error)
  }
}

const handleGoogleCallback = (req, res, next) => {
  try {
    if (req.user && req.user.requiresCompletion) {
      // 如果用戶需要補充資料，返回 JSON 指示前端進行重定向
      return res.json({
        status: 'requires_completion',
        message: '需填寫其他資料',
        method: 'post',
        redirect: '/api/patients', // 前端根據此路徑進行跳轉
        data: req.user
      })
    }

    const { password, birthDate, idNumber, ...userData } = req.user // 拿掉敏感資料
    const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, { expiresIn: '30d' }) // 簽發 JWT，效期為 30 天

    return res.json({
      status: 'success',
      data: {
        token,
        user: userData
      }
    })
  } catch (error) {
    next(error)
  }
}

const signIn = (req, res, next) => {
  try {
    const userData = req.user
    const token = jwt.sign({
      id: userData.id,
      role: userData.role
    }, process.env.JWT_SECRET, { expiresIn: '30d' }) // 簽發 JWT，效期為 30 天
    delete userData.password
    res.json({
      status: 'success',
      data: {
        token,
        user: userData
      }
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getGoogleOneTapPage,
  handleGoogleCallback,
  signIn
}
