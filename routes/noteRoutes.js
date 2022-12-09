const express= require('express')

const router= express.Router()

const noteController= require('../controllers/noteController')

const verifyJWT= require('../middlewares/verifyJWT')

router.use( verifyJWT )

router.route('/')
    .get(noteController.getAllNotes)
    .post(noteController.createNote)
    .patch(noteController.updateNote)
    .delete(noteController.deleteNote)

module.exports= router