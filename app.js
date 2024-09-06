const express = require('express')
const routes = require('./routes')
const app = express()
const port = process.env.PORT || 3000
const prisma = require('./services/prisma')
const apiErrorHandler = require('./middleware/apiErrorHandler')

app.use(express.json())

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
