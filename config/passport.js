const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const prisma = require('../services/prisma')
const bcrypt = require('bcryptjs')
// const GoogleOneTapStrategy = require('passport-google-one-tap').GoogleOneTapStrategy
const passportJWT = require('passport-jwt')

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

// passport.use(
//   new GoogleOneTapStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       verifyCsrfToken: false // 可選，測試期間可以設為 false，正式上線建議開啟
//     },
//     async (profile, done) => {
//       try {
//         const existingUser = await prisma.patient.findUnique({
//           where: { email: profile.emails[0].value }
//         })

//         if (existingUser) {
//           return done(null, existingUser) // 如果用戶存在，返回用戶
//         } else {
//           // 若用戶不存在，創建新用戶但不包含 idNumber
//           const newUser = await prisma.patient.create({
//             data: {
//               name: profile.displayName,
//               email: profile.emails[0].value,
//               requiresCompletion: true // 需要填寫額外資料
//             }
//           })

//           // 將新用戶信息存入 session，然後重定向到填寫 idNumber 的頁面
//           return done(null, newUser)
//         }
//       } catch (error) {
//         return done(error)
//       }
//     }
//   )
// )

const jwtOptions = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}

passport.use(new JWTStrategy(jwtOptions, async (jwtPayload, done) => {
  try {
    const user = await prisma.patient.findUnique({ where: { id: jwtPayload.id } })
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  } catch (error) {
    return done(error)
  }
}))

passport.serializeUser((user, done) => {
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
})

module.exports = passport
