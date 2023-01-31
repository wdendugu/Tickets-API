const User = require('../models/User')
const Note = require('../models/Note')
const asyncHandler = require('express-async-handler')

//@desc: todos las notas
//@ruta: GET /notes
//@acceso: Privado
const getAllNotes = asyncHandler (async (req, res) => {
    const notes = await Note.find().lean()

    if (!notes?.length) {
        return res.status(400).json({message: 'No se encontraron tickets'})
    }
    
    // Agregar nombre de usuario antes de enviar la nota
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec()
        return { ...note, username: user.username}
    }))
    res.json(notesWithUser)
})

//@desc: crear nota
//@ruta: POST /notes
//@accesp Privado
const createNewNote = asyncHandler (async (req, res) => {
    const {user, title, text, location} = req.body

    // Confirmar info
    if (!user || !title || !text || !location) {
        return res.status(400).json({message: 'Todos los campos son necesarios'})
    }

    // Control duplicado
    const duplicate = await Note.findOne({ title }).collation({locale:'en', strength: 2}).lean().exec()

    if (duplicate) {
        res.status(409).json({message: 'Titulo de nota ya existe'})
    }

    // Crear nota
    const note = await Note.create({user, title, text, location})

    if(note) {
        res.status(201).json ({message : `Nota con titulo "${title}" creada`})
    } else {
        res.status(400).json ({message: "Infomacion invalida recibida"})
    }
})

//@desc: modificar nota
//@ruta: PATCH/notes
//@accesp Privado

// IMPLEMENTAR LOGICA PARA CAMBIO DE TITULO O TEXTO \\

const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, location, completed } = req.body


    if (!id || !user || !title || !text || !location ||typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Nota no encontrada' })
    }


    // const duplicate = await Note.findOne({ title }).collation({locale:'en', strength: 2}).lean().exec()

    // if (duplicate && duplicate?._id.toString() !== id) {
    //     return res.status(409).json({ message: 'Titulo de nota duplicado' })
    // }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed
    note.location = location

    const updatedNote = await note.save()

    res.json(`Nota con id '${updatedNote.ticket}' actualizada`)
})

//@desc: eliminar nota
//@ruta: DELETE/notes
//@accesp Privado
const deleteNote = asyncHandler (async (req, res) => {
    const {id} = req.body

    if(!id) {
        return res.status(400).json({message: "El id de la nota es necesario"})
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({message: "Nota no encontrado"})
    }

    const result = await note.deleteOne()

    const reply = `Nota ${result.ticket} eliminado`

    res.json(reply)

})

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote,
}