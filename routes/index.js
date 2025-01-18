const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth-controller')
const { authenticated } = require('../middleware/api-auth')
const { csrfProtection } = require('../controllers/auth-controller')

const doctorsRouter = require('./apis/doctor-routes')
const patientsRouter = require('./apis/patient-routes')
const doctorScheduleRoutes = require('./apis/doctor-schedules-routes')
const appointmentRoutes = require('./apis/appointment-routes')
const adminRoutes = require('./apis/admin-routes')

router.use('/doctors', doctorsRouter)
router.use('/patients', patientsRouter)
router.use('/doctor-schedules', doctorScheduleRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/admins', adminRoutes)

router.post('/sign-out', authController.signOut)

router.get('/csrf-token', authenticated, csrfProtection, authController.csrfToken)

router.get('/', (req, res) => {
  return res.send('Hello World!')
})

module.exports = router
