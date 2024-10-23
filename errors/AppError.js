class AppError extends Error {
  constructor (message, status) {
    super(message) // 呼叫父類別的構造函數
    this.status = status // 設定自定義的 status
    this.isOperational = true // 可選：用來標記為可運行的錯誤
  }
}

module.exports = AppError
