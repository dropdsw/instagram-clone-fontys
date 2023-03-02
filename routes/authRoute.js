const router = require('express').Router()
const authController = require('../controllers/authController')

router
    .route('/register')
    .post(authController.register)

router
    .route('/login')
    .post(authController.login)

router
    .route('/logout')
    .post(authController.logout)

router
    .route('/refresh')
    .post(authController.generateAccessToken)

module.exports = router;