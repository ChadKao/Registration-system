const express = require('express')
const router = express.Router()
const { authenticatedByLocal } = require('../middleware/api-auth')
const authController = require('../controllers/auth-controller')

const doctorsRouter = require('./apis/doctor-routes')
const patientsRouter = require('./apis/patient-routes')
const doctorScheduleRoutes = require('./apis/doctor-schedules-routes')
const appointmentRoutes = require('./apis/appointment-routes')

router.use('/doctors', doctorsRouter)
router.use('/patients', patientsRouter)
router.use('/doctor-schedules', doctorScheduleRoutes)
router.use('/appointments', appointmentRoutes)
router.post('/admins/sign-in', authenticatedByLocal('local-admin'), authController.signIn)

router.get('/', (req, res) => {
  return res.send('Hello World!')
})

module.exports = router
