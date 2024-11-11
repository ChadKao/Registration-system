// /routes/apis/patient-routes.js
const express = require('express')
const router = express.Router()
const patientController = require('../../controllers/apis/patient-controller')
const passport = require('../../config/passport')
const { authenticatedByLocal } = require('../../middleware/api-auth')
const authController = require('../../controllers/auth-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

router.post('/sign-in', authenticatedByLocal('local'), authController.signIn)
router.get('/login/google', authController.getGoogleOneTapPage)
router.post('/auth/google/callback', passport.authenticate('google-one-tap', { session: false }), authController.handleGoogleCallback)

router.post('/', authenticated, authenticatedAdmin, patientController.createPatient)
router.get('/', patientController.getAllPatients)
router.get('/:id', patientController.getPatientById)
router.put('/:id', authenticated, authenticatedAdmin, patientController.updatePatient)
router.delete('/:id', authenticated, authenticatedAdmin, patientController.deletePatient)

module.exports = router
