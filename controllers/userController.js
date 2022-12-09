const User= require('../models/User')
const Note= require('../models/Note')

const bcrypt= require('bcrypt')

const asyncHandler= require('express-async-handler')


// @desc: get all users 
// @route: GET /users 
// @access: PRIVATE
const getAllUsers= asyncHandler(
    async(request, response)=> {
        
        // send the request to the database: 
        const users= await User.find().select('-password').lean()

        // check if the users array actually has length:
        if (!users.length){
            return response.status(404).json(
                {
                    "Not found!": "No user's found in the database!"
                }
            )
        }
        return response.json(users)
    }
)


// @desc: create a new user
// @route: POST /users 
// @access: PRIVATE
const createUser= asyncHandler(
    async(request, response)=> {

        const { username, password, roles }= request.body 

        const invalid= !username || !password

        if (invalid){
            
            return response.status(400).json(
                {
                    "message": "All fields are required!"
                }
            )
        }
        
        // verify duplicates: 
        const duplicate= await User.findOne({"username": username}).collation({locatiion: 'en', strength: 2}).lean().exec()

        if (duplicate){
            return response.status(409).json(
                {
                    "message": "A user with the same username already exist!"
                }
            )
        }

        // hash the user password: 
        const hashedPassword= await bcrypt.hash(password, 10)
        
        // create and save the user in the database: 
        const userObject= (!Array.isArray( roles ) || roles.length )
                        ? {
                            "username": username,
                            "password": hashedPassword
                        } 
                        :
                        {
                            "username": username,
                            "password": hashedPassword,
                            "roles": roles
                        }

        const user= await User.create(userObject)

        if (user){
            // means user was successfully created in the database: 
            response.status(201).json(
                {
                    "Created": `User ${user.username} successfully registered in the database`
                }
            )
        }
        else {
            response.status(400).json(
                {
                    "Error": "An error occured while creating the user!"
                }
            )
        }
    }
)


// @desc: update a user
// @route: PATCH /users 
// @access: PRIVATE 
const updateUser= asyncHandler(
    async(request, response)=> {
        
        // retrieve request data: 
        const { id, username, password, roles, active }= request.body 

        // confirm data: 
        const invalid= !id || !username || !roles || !roles.length || !Array.isArray(roles) || 
        typeof active !== 'boolean'
        if (invalid){
            return response.status(400).json(
                {
                    "Bad Request": "All fields are required!"
                }
            )
        }

        // check if user exists in the database: 
        const foundUser= await User.findById(id).exec()

        if (!foundUser){
            return response.status(404).json(
                {
                    "Not found": `User with id ${id} not found in the database!`
                }
            )
        }

        // find duplicates for the username: 
        const duplicate= await User.findOne({"username": foundUser.username}).collation({locatiion: 'en', strength: 2}).lean().exec()
        
        // check if the duplicate has the same id as the request id data:
        const impossibleUpdate= duplicate && duplicate._id.toString() !== id 
        if (impossibleUpdate){
            return response.status(409).json(
                {
                    "message": `A user with the username ${username} already exists`
                }
            )
        }

        // else we modify the user infos: 
        foundUser.username= username 
        foundUser.roles= roles 
        foundUser.active= active 
         
        if (password){
            // hash password: 

            const hashedPassword= await bcrypt.hash(password, 10)
            foundUser.password= hashedPassword
        }

        const updatedUser= await foundUser.save()

        response.status(201).json(
            {
                "Updated": `User ${updatedUser.username} updated!`
            }
        )
    }
)


// @desc: delete a user 
// @route: DELETE /users
// @access: PRIVATE 
const deleteUser= asyncHandler(
    async(request, response)=> {

        const { id }= request.body 

        if (!id){
            return response.status(400).json(
                {
                    "Bad Request": "ID of user to be deleted is required!"
                }
            )
        }

        // find the user in the database: 
        const foundUser= await User.findById( id ).exec()

        if (!foundUser){
            return response.status(404).json(
                {
                    "message": `User with ID ${id} not found in the database!`
                }
            )
        }

        // check if the user has assigned notes: 
        const notes= await Note.find({ "user": id }).lean().exec()

        if (notes){
            // we can't delete the user: 
            return response.status(401).json(
                {
                    "message": "User has assigned notes!"
                }
            )
        }

        // delete the user: 
        const deletedUser= await foundUser.deleteOne()

        response.json(
            {
                "Deleted": `User ${deletedUser.username} with ID ${deletedUser._id} deleted!`
            }
        )
    }
)

module.exports= {
    getAllUsers, 
    createUser,
    updateUser,
    deleteUser
}