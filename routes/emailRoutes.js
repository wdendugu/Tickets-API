const express = require ("express")
const router = express.Router()
const emailController = require('../controllers/emailController')
const verifyJWT = require ("../middleware/verifyJWT")

router.use(verifyJWT)

router.route('/')
    .post(emailController.sendMail)


module.exports = router