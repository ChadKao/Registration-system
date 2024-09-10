const express = require('express')
const router = express.Router()

const doctorsRouter = require('./apis/doctor-routes')
const patientsRouter = require('./apis/patient-routes')
const doctorScheduleRoutes = require('./apis/doctor-schedules')
const appointmentRoutes = require('./apis/appointments')

router.use('/doctors', doctorsRouter)
router.use('/patients', patientsRouter)
router.use('/doctor-schedules', doctorScheduleRoutes)
router.use('/appointments', appointmentRoutes)

router.get('/', (req, res) => {
  res.send('Hello World!')
})

module.exports = router
