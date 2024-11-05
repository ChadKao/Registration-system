// /routes/apis/patient-routes.js
const express = require('express')
const router = express.Router()
const patientController = require('../../controllers/apis/patient-controller')
const passport = require('../../config/passport')

// 病人 CRUD API 路由

router.post('/sign-in', passport.authenticate('local', { session: false }), patientController.signIn)

router.post('/', patientController.createPatient)
router.get('/', patientController.getAllPatients)
router.get('/:id', patientController.getPatientById)
router.put('/:id', patientController.updatePatient)
router.delete('/:id', patientController.deletePatient)

module.exports = router
