const passport = require('../config/passport')
const prisma = require('../services/prisma')

const authenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      if (req.body.idNumber || req.body.birthDate) {
        return res.status(400).json({
          status: 'error',
          message: '當使用 JWT token 時，請勿提供 idNumber 或 birthDate 資料'
        })
      }
      return passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
        if (user.role === 'admin') {
          req.user = user
          // 若使用 Custom Callback(需要的話需手動設置 req.user，才能在下一個controller使用req.user)
        } else {
          req.body = {
            ...req.body, // 以appointments/by-patient路由為例，這邊原本只有放recaptchaResponse
            idNumber: user.idNumber,
            birthDate: user.birthDate
          }
        }
        return next()
      })(req, res, next)
    } else {
      const idNumber = req.body.idNumber
      if (!idNumber) {
        return res.status(400).json({ status: 'error', message: '缺少必要的資料' })
      } // idNumber是用來查詢該用戶有無設置密碼
      const user = await prisma.patient.findUnique({
        where: { idNumber },
        select: { id: true, password: true }
      })

      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Patient not found.(若為初診病人，請先填寫初診資料)' })
      }
      if (user.password) {
        // 若用戶已設定密碼但未攜帶 JWT token，要求登入
        return res.status(401).json({ status: 'error', message: '需要先登入' })
      }

      // 若未設定密碼，直接讓請求通過
      return next()
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next()
  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

const authenticatedByLocal = (role) => {
  return (req, res, next) => {
    passport.authenticate(role, { session: false }, (err, user, info) => {
      if (err) {
        console.err(err)
        return res.status(500).json({ status: 'error', message: 'Internal server error' })
      }
      if (!user) {
        return res.status(401).json({ status: 'error', message: info.message })
      }
      req.user = user
      next()
    })(req, res, next)
  }
}

module.exports = {
  authenticated,
  authenticatedAdmin,
  authenticatedByLocal
}
