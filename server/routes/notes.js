const express = require("express")
const authorize = require("../middleware/auth")
const { getNotes, getNoteById, createNote, updateNote, deleteNote} = require("../controllers/notesController");


const router = express.Router()

router.use(authorize)

router.get('/', getNotes)
router.get('/:id', getNoteById)
router.post('/', createNote)
router.patch('/:id', updateNote)
router.delete('/:id', deleteNote)

module.exports = router