const User= require('../models/User')
const Note= require('../models/Note')

const asyncHandler= require('express-async-handler')

// @desc: get all notes 
// @route: GET /notes 
// @access: PRIVATE 
const getAllNotes= asyncHandler(
    async(request, response)=> {

        // get the notes array: 
        const notes= await Note.find().lean()

        if (!notes.length){
            return response.status(404).json(
                {
                    "message": "No notes found in the database!"
                }
            )
        }

        // else return the notes list: 
        return response.json(notes)
    }
)


// @desc: create a note 
// @route: POST /notes 
// @access: PRIVATE 
const createNote= asyncHandler(
    async(request, response)=> {

        // retrieve request body: 
        const { user, title, body}= request.body

        // confirm data: 
        const invalid= !user || !title || !body 
        if (invalid){
            return response.status(400).json(
                {
                    "message": "All fields are required!"
                }
            )
        }

        // create and save the note Object: 
        const noteObject= {
            "user": user,
            "title": title,
            "body": body
        }

        const note= await Note.create(noteObject)

        if (note){
            // then the note was created: 
            response.status(201).json(
                {
                    "message": `Note ${note.title.substring(0, 25)}... successfully created`
                }
            )
        }
        else {
            response.status(400).json(
                {
                    "message": "An error occured while creating note!"
                }
            )
        }
    }
)


// @desc: update a note 
// @route: PATCH /notes 
// @access: PRIVATE 
const updateNote= asyncHandler(
    async(request, response)=> {
        
        // retrieve request data: 
        const { id, user, title, body, completed }= request.body 

        // confirm data: 
        const invalid= !id || !title || !body || typeof completed !== 'boolean' 
        if (invalid){
            return response.status(400).json(
                {
                    "message": "All fields are required!"
                }
            )
        }

        // find the note to be modified: 
        const foundNote= await Note.findById(id).exec()

        // check for note existence: 
        if (!foundNote){
            return response.status(404).json(
                {
                    "message": `Note with ID ${id} not found!`
                }
            )
        }

        // check if the user provided in the request body ( id ) matches a user in the DB
        const noteUser= await User.findById( user ).lean().exec()
        if (!noteUser){
            return response.status(400).json(
                {
                    "message": `There's no user with ID ${user} in the database!`
                }
            )
        }

        //else modify notes informations: 
        foundNote.title= title
        foundNote.body= body 
        foundNote.completed= completed 

        await foundNote.save()

        response.status(201).json(
            {
                "message": `Note with the title ${foundNote.title.substring(0, 25)}... updated!`
            }
        )
    }
)


// @desc: delete a note 
// @route: DELETE /notes
// @access: PRIVATE 
const deleteNote= asyncHandler(
    async(request, response)=> {

        // retrieve request data: 
        const { id }= request.body 

        if (!id) {
            return response.status(400).json(
                {
                    "message": "ID of note to be deleted is required!"
                }
            )
        }

        // find the note: 
        const foundNote= await Note.findById(id).exec()

        if (!foundNote){
            return response.status(404).json(
                {
                    "message": `Note with ID ${id} not found!`
                }
            )
        }

        const deletedNote= await foundNote.deleteOne()

        response.json(
            {
                "message": `Note ${deletedNote.title.substring(0, 10)}... with ID ${deletedNote._id} deleted!`
            }
        )
    }
)

module.exports= {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}