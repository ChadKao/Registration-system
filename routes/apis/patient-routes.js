// /routes/apis/patient-routes.js
const express = require('express')
const router = express.Router()
const patientController = require('../../controllers/apis/patient-controller')
const passport = require('../../config/passport')
const { authenticatedByLocal } = require('../../middleware/api-auth')
const authController = require('../../controllers/auth-controller')

router.post('/sign-in', authenticatedByLocal, authController.signIn)
router.get('/login/google', authController.getGoogleOneTapPage)
router.post('/auth/google/callback', passport.authenticate('google-one-tap', { session: false }), authController.handleGoogleCallback)

router.post('/', patientController.createPatient)
router.get('/', patientController.getAllPatients)
router.get('/:id', patientController.getPatientById)
router.put('/:id', patientController.updatePatient)
router.delete('/:id', patientController.deletePatient)

module.exports = router
