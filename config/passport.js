const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const prisma = require('../services/prisma')
const bcrypt = require('bcryptjs')
const GoogleOneTapStrategy = require('passport-google-one-tap').GoogleOneTapStrategy
const passportJWT = require('passport-jwt')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.use(new LocalStrategy({
  usernameField: 'idNumber', // 自訂使用的欄位
  passwordField: 'password'
}, async (idNumber, password, done) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { idNumber } })
    if (!patient) {
      return done(null, false, { message: '帳號或密碼錯誤' })
    }
    const isPasswordValid = await bcrypt.compare(password, patient.password)
    if (!isPasswordValid) {
      return done(null, false, { message: '帳號或密碼錯誤' })
    }
    return done(null, patient)
  } catch (error) {
    return done(error)
  }
}))

passport.use('local-admin', new LocalStrategy(
  {
    usernameField: 'account',
    passwordField: 'password'
  },
  async (account, password, done) => {
    try {
      const admin = await prisma.admin.findUnique({ where: { account } })
      if (!admin) {
        return done(null, false, { message: '帳號或密碼錯誤' })
      }
      const isPasswordValid = await bcrypt.compare(password, admin.password)
      if (!isPasswordValid) {
        return done(null, false, { message: '帳號或密碼錯誤' })
      }
      return done(null, admin)
    } catch (error) {
      return done(error)
    }
  }
))

passport.use(
  new GoogleOneTapStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      // clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      verifyCsrfToken: false // 可選，測試期間可以設為 false，正式上線建議開啟
    },
    async (profile, done) => {
      try {
        const existingUser = await prisma.patient.findUnique({
          where: { email: profile.emails[0].value }
        })

        if (existingUser) {
          return done(null, existingUser) // 這邊會將existingUser附在req.user上 或(err, user)的user
        } else {
          const user = {
            email: profile.emails[0].value,
            requiresCompletion: true
          }
          return done(null, user)
        }
      } catch (error) {
        return done(error)
      }
    }
  )
)

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/patients/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await prisma.patient.findUnique({
      where: { email: profile.emails[0].value }
    })

    if (existingUser) {
      return done(null, existingUser) // 這邊會將existingUser附在req.user上 或(err, user)的user
    } else {
      const user = {
        email: profile.emails[0].value,
        requiresCompletion: true
      }
      return done(null, user)
    }
  } catch (error) {
    return done(error)
  }
}
))

const cookieExtractor = (req) => {
  let token = null
  if (req && req.cookies) {
    token = req.cookies.jwt // 假設 JWT 儲存在名為 'jwt' 的 cookie 中
  }
  return token
}

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromExtractors([
    cookieExtractor, // 從 cookies 提取
    ExtractJWT.fromAuthHeaderAsBearerToken() // 從 Authorization 標頭提取
  ]),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const role = jwtPayload.role
    let user

    if (role === 'admin') {
      user = await prisma.admin.findUnique({ where: { id: jwtPayload.id } })
    } else {
      user = await prisma.patient.findUnique({ where: { id: jwtPayload.id } })
    }
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error)
  }
}))

/* passport.serializeUser((user, done) => {
  done(null, user.id) // 將 user 的 ID 序列化到 session
})

// 反序列化用戶，根據 session 的 user ID 取出完整用戶
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.patient.findUnique({ where: { id } })
    done(null, user) // 將用戶資料傳入 req.user
  } catch (error) {
    done(error, null)
  }
}) */

module.exports = passport
