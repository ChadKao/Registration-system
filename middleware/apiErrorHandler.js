const apiErrorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    // 檢查是否是 Prisma 的已知錯誤
    if (err.name === 'PrismaClientKnownRequestError') {
      // 通用地處理 Prisma 已知錯誤，提取 meta 資訊（如果有的話）
      const errorMessage = err.meta
        ? `Error in field: ${err.meta.target}`
        : 'A database error occurred.'

      res.status(400).json({
        status: 'error',
        message: errorMessage,
        code: err.code // 也可以返回 Prisma 錯誤碼以便進一步處理
      })
    } else {
      // 處理其他非 Prisma 錯誤
      res.status(err.status || 500).json({
        status: 'error',
        message: err.message // 返回簡化的錯誤訊息
      })
    }
  } else {
    // 處理非 Error 類型的錯誤
    res.status(500).json({
      status: 'error',
      message: `${err}`
    })
  }
  console.error(err.stack) // 保留詳細錯誤堆疊日誌以供伺服器端調試
  next(err) // 將錯誤傳遞到下一個錯誤處理中介軟體
}

module.exports = apiErrorHandler
