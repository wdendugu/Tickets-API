const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


//@desc: todos los usuarios
//@ruta: GET /users
//@accesp Privado
const getAllUsers = asyncHandler (async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({message: 'No se encontraron usuarios'})
    }
    res.json(users)
})

//@desc: crear usuario
//@ruta: POST /users
//@accesp Privado
const createNewUser = asyncHandler (async (req, res) => {
    const {username, password, roles, email} = req.body

    // Confirmar info
    if (!username || !password || !email) {
        return res.status(400).json({message: 'Todos los campos son necesarios'})
    }

    // Controlar duplicados
    const duplicate = await User.findOne({username}).collation({locale:'en', strength: 2}).lean().exec()
    if (duplicate) {
        return res.status(409).json({message: 'El usuario ya existe'})
    }
    
    // Hashear pass
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = (!Array.isArray(roles) || !roles.length) 
        ? {username, "password":hashedPwd} 
        : {username, "password":hashedPwd , roles, email}

    // Crear usuario
    const user = await User.create(userObject)

    if(user) {
        res.status(201).json ({message : `Usuario ${username} creado`})
    } else {
        res.status(400).json ({message: "Infomacion invalida recibida"})
    }

})

//@desc: actualizar usuario
//@ruta: PATCH /users
//@accesp Privado
const updateUser = asyncHandler (async (req, res) => {
    const {id, username, roles, active, password, email} = req.body

    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean' || !email) {
        return res.status(400).json({message: 'Todos los campos son necesarios'})
    }

    const user = await User.findOne({id}).exec()

    if(!user) {
        return res.status(400).json({message: "Usuario no encontrado"})
    }

    const duplicate = await User.findOne({username}).collation({locale:'en', strength: 2}).lean().exec()
    
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({message: 'El nombre de usuario ya existe'})
    }
    user.username = username
    user.roles = roles
    user.active = active
    user.email = email

    if (password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({message : `${updatedUser.username} actualizado`})

})

//@desc: eliminar usuario
//@ruta: DELETE /users
//@accesp Privado
const deleteUser = asyncHandler (async (req, res) => {
    const {id} = req.body

    if(!id) {
        return res.status(400).json({message: "El id del usuario es necesario"})
    }

    const note = await Note.findOne({user: id}).lean().exec()
    if (note) {
        return res.status(400).json({message: "El usuario tiene tickets asignados"})
    }

    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({message: "Usuario no encontrado"})
    }

    const result = await user.deleteOne()

    const reply = `Usuario ${result.username} with ID ${result.id} eliminado`

    res.json(reply)
})

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
}