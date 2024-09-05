const express = require('express')
const routes = require('./routes')
const app = express()
const port = process.env.PORT || 3000
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

app.use(routes)

process.on('SIGINT', async () => {
  await prisma.$disconnect() // 斷開 Prisma 客戶端連接
  process.exit(0) // 結束應用程式
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})
module.exports = app
