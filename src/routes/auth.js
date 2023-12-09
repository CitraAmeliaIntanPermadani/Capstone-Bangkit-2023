const express = require('express')
const router = express.Router()
// LOGIC NYA DARI API
// 1. register
const { register, login } = require('../controllers/auth.js')

router.route('/login').post(login)
router.route('/register').post(register)

module.exports = router
