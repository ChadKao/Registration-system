// /routes/apis/doctor-routes.js
const express = require('express')
const router = express.Router()
const doctorController = require('../../controllers/apis/doctor-controller')

// 醫師 CRUD API 路由
router.get('/', doctorController.getAllDoctors)
router.get('/specialties', doctorController.getSpecialties)
router.get('/search-doctors', doctorController.searchDoctors)
router.get('/:id', doctorController.getDoctorById)

module.exports = router
