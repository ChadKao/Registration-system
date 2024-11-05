const express = require('express')
const routes = require('./routes')
const app = express()
const port = process.env.PORT || 3000
const prisma = require('./services/prisma')
const apiErrorHandler = require('./middleware/apiErrorHandler')

const VALID_API_KEY = process.env.VALID_API_KEY
const cors = require('cors')

// 允許的前端域名 (包括本地開發和生產環境)
const allowedOrigins = [
  'http://localhost:3000', // 本地開發時的前端域名
  'https://medical-appointment-eight.vercel.app' // 生產環境中的前端域名
]

// CORS 設定
app.use(cors({
  origin: function (origin, callback) {
    // 如果請求的 origin 存在於 allowedOrigins 中，則允許，否則拒絕
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' })
})

// 中介軟件來驗證 API 金鑰
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === VALID_API_KEY) {
    next() // 金鑰有效，繼續處理請求
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
