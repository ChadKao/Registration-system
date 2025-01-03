const express = require('express')
const routes = require('./routes')
const app = express()
const port = process.env.PORT || 3000
const prisma = require('./services/prisma')
const apiErrorHandler = require('./middleware/apiErrorHandler')
const passport = require('./config/passport')
const cookieParser = require('cookie-parser')

const VALID_API_KEY = process.env.VALID_API_KEY
const cors = require('cors')

// 允許的前端域名 (包括本地開發和生產環境)
const allowedOrigins = [
  'http://localhost:3000', // 本地開發時的前端域名
  'https://medical-appointment-eight.vercel.app', // 生產環境中的前端域名
  'https://registration-system-2gho.onrender.com',
  'https://console.cron-job.org'
]
app.set('trust proxy', true) // 在 Express 中，如果想要依賴 X-Forwarded-Proto，可以設置 app.set('trust proxy', true);，這樣 Express 會自動根據此標頭設定 req.protocol
app.use(cookieParser())
app.use(passport.initialize())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// CORS 設定
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] // 獲取 User-Agent 標頭
  const origin = req.headers.origin
  const allowedUserAgents = ['PostmanRuntime', 'cron-job.org']

  // 允許render在啟動伺服器時為了確認狀態所發的請求
  if (!origin && (req.method === 'HEAD' || req.method === 'GET') && req.path === '/') {
    return next()
  }

  if (!origin && userAgent && allowedUserAgents.some(agent => userAgent.includes(agent))) {
    return next() // 健康檢查請求或來自特定 User-Agent 的請求直接放行
  }

  const validPaths = [
    '/api/patients/auth/google/callback',
    '/api/patients/login/google',
    '/api/patients/login/google-one-tap'
  ]

  if (validPaths.includes(req.path)) {
    return next()
  }
  cors({
    origin: function (origin, callback) {
      if (process.env.NODE_ENV === 'development' && !origin) {
        return callback(null, true)
      }

      // 如果請求的 origin 存在於 allowedOrigins 中，則允許，否則拒絕
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true // 允許攜帶 cookie
  })(req, res, next)
}
)

// 中介軟件來驗證 API 金鑰
app.use((req, res, next) => {
  // Google One Tap 向 data-login_uri (/auth/google/callback) 發送 ID Token 時
  const validPaths = [
    '/api/patients/auth/google/callback',
    '/api/patients/login/google',
    '/api/patients/login/google-one-tap'
  ]

  if (validPaths.includes(req.path)) {
    return next()
  }
  // // 如果在本地開發環境，直接通過驗證
  if (process.env.BASE_URL === 'http://localhost:3000') {
    return next()
  }
  const apiKey = req.headers['x-api-key']

  if (apiKey && apiKey === VALID_API_KEY) {
    return next() // 金鑰有效，繼續處理請求
  } else {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized'
    }) // 金鑰無效，拒絕請求
  }
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', routes) // 所有路由都會以 /api 開頭
app.get('/', (req, res) => res.send('Hello World!'))

app.use(apiErrorHandler)

process.on('SIGINT', async () => {
  await prisma.$disconnect() // 斷開 Prisma 客戶端連接
  process.exit(0) // 結束應用程式
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
module.exports = app
