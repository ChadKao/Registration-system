const passport = require('../config/passport')
const prisma = require('../services/prisma')

const authenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })
        req.body = {
          ...req.body,
          idNumber: user.idNumber,
          birthDate: user.birthDate
        }
        next()
      })(req, res, next)
    } else {
      const idNumber = req.body.idNumber
      if (!idNumber) {
        return res.status(400).json({ status: 'error', message: '缺少必要的資料' })
      }
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
  if (req.user && req.user.isAdmin) return next()
  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}
