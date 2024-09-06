const express = require('express')
const router = express.Router()

const doctorsRouter = require('./apis/doctor-routes')
const patientsRouter = require('./apis/patient-routes')

router.use('/doctors', doctorsRouter)
router.use('/patients', patientsRouter)

router.get('/', (req, res) => {
  res.send('Hello World!')
})

module.exports = router
