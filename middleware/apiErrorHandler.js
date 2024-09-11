const apiErrorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    // 檢查是否是 Prisma 的已知錯誤
    if (err.name === 'PrismaClientKnownRequestError') {
      // 處理 Prisma 已知錯誤
      let errorMessage = 'A database error occurred.'
      let statusCode = 400 // 預設為 400
      let errorDetails = null

      // 檢查是否有 meta 資訊，並提取
      if (err.meta) {
        errorDetails = err.meta
      }

      switch (err.code) {
        case 'P2002':
          errorMessage = 'Unique constraint failed. Check the uniqueness of the data.'
          statusCode = 400
          break
        case 'P2025':
          errorMessage = 'The record you are trying to delete/update does not exist.'
          statusCode = 404
          break
        case 'P2003':
          errorMessage = 'Foreign key constraint failed. Ensure the referenced record exists.'
          statusCode = 400
          break
        case 'P2004':
          errorMessage = 'The provided value for one of the columns is not valid.'
          statusCode = 400
          break
        case 'P2016':
          errorMessage = 'No record found for the given query.'
          statusCode = 404
          break
        case 'P2009': // 枚舉約束違規（例如插入不符合 enum 規範的值）
          res.status(400).json({
            status: 'error',
            message: 'Enum constraint failed. The provided value does not match any allowed values.',
            code: err.code
          })
          break
        default:
          errorMessage = 'An unknown database error occurred.'
          statusCode = 500 // 未知錯誤，回傳 500
      }

      res.status(statusCode).json({
        status: 'error',
        message: errorMessage,
        code: err.code,
        details: errorDetails // 將 meta 資訊包含在 response 中
      })
    } else {
      // 處理其他非 Prisma 錯誤
      res.status(err.status || 500).json({
        status: 'error',
        message: err.message
      })
    }
  } else {
    // 處理非 Error 類型的錯誤
    res.status(500).json({
      status: 'error',
      message: `${err}`
    })
  }
  console.error(err) // 保留詳細錯誤訊息
  next(err) // 將錯誤傳遞到下一個錯誤處理中介軟體
}

module.exports = apiErrorHandler
