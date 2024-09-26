const express = require('express')
const routes = require('./routes')
const app = express()
const port = process.env.PORT || 3000
const prisma = require('./services/prisma')
const apiErrorHandler = require('./middleware/apiErrorHandler')

const VALID_API_KEY = process.env.VALID_API_KEY || 'your_default_api_key'

// 中介軟件來驗證 API 金鑰
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === VALID_API_KEY) {
    next() // 金鑰有效，繼續處理請求
  } else {
    res.status(401).json({ message: 'Unauthorized' }) // 金鑰無效，拒絕請求
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
