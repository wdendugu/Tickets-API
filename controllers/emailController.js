const User = require('../models/User')
const Notes = require('../models/Note')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const EmailSender = require ('../middleware/sendMail')

//@desc: enviar correo
//@ruta: POST /send
//@accesp Privado
const sendMail = asyncHandler (async (req, res) => {
    const { email, text } = req.body
    if (!text || !email) {
        return res.status(400).json({message: 'Todos los campos son necesarios'})
    }
    EmailSender({email, text})
    res.json({ msg: "El mensaje ha sido enviado" });
})

module.exports = {sendMail}