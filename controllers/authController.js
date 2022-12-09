const User= require('../models/User')

const bcrypt= require('bcrypt')

const jwt= require('jsonwebtoken')

const asyncHandler= require('express-async-handler')


// @desc: provides an access token to the logged user 
// @route: /auth/login /POST 
// @access: PUBLIC 
const login = asyncHandler(
    async( request, response )=> {

        // retrieve request data: 
        const { username, password }= request.body

        // verify data: 
        if ( !username || !password ){
            return response.status(400).json(
                {
                    message: 'All fields are required'
                }
            )
        }

        // find the user : 
        const foundUser= await User.findOne({ username }).lean().exec()

        // verify user existence: 
        if ( !foundUser ){
            return response.status(404).json(
                {
                    message: "No user with such a username!"
                }
            )
        }

        // verify passwords match : 
        const match= await bcrypt.compare(password, foundUser.password)
        if ( !match ){
            return response.status(401).json(
                {
                    message: "Wrong password!"
                }
            )
        }

        // create access token: 
        const accessToken= jwt.sign(
            {
                userInfo: {
                    "username": username,
                    "roles": foundUser.roles,
                    "id": foundUser._id
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: '15m'
            }
        )

        // refresh token: 
        const refreshToken= jwt.sign(
            {
                "username": username
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: '7d'
            }
        )

        // create a cookie containing the refresh token: 
        response.cookie(
            'refreshToken',
            refreshToken,
            {
                httpOnly: true,
                secure: true,
                sameSite: 'None',
                maxAge: 7* 24* 60* 60* 1000
            }
        )

        // send the access token as request response 
        return response.status(201).json( accessToken )
    }
)


// @desc: gives another access token to the user who's one has expired 
// @route: /auth/refresh /GET
// @access: PUBLIC 
const refresh= asyncHandler(
    async( request, response )=> {

        // retrieve refresh token cookie: 
        const cookies= request.cookies 
        
        // verify refresh token:
        if ( !cookies?.refreshToken ){
            return response.status(401).json(
                {
                    message: "No refresh token cookie found!"
                }
            )
        }

        const refreshToken= cookies.refreshToken 

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            asyncHandler(
                async( error, decoded )=> {
                    if ( error ){
                        return response.status(403).json(
                            {
                                message: error
                            }
                        )
                    }

                    // find user :
                    const foundUser= await User.findOne({ username: decoded.username }).lean().exec()
                    if ( !foundUser || !foundUser.active ){
                        return response.status(403).json(
                            {
                                message: "User not found or inactive"
                            }
                        )
                    }

                    // create access token: 
                    const accessToken= jwt.sign(
                        {
                            userInfo: {
                                "username": foundUser.username,
                                "roles": foundUser.roles,
                                "id": foundUser._id
                            }
                        },
                        process.env.ACCESS_TOKEN_SECRET,
                        {
                            expiresIn: '15m'
                        }
                    )

                    response.status(201).json( accessToken )
                }
            )
        )
    }
)


// @desc: clears refresh token cookie on logout 
// @route: /auth/logout /POST 
// @access: PUBLIC 
const logout= asyncHandler(
    async( request, response )=> {

        // retrieve request cookies 
        const cookies= request.cookies
        
        // verify refreshToken cookie 
        if ( !cookies?.refreshToken ){
            return response.status(200).json(
                {
                    message: "No content"
                }
            )
        }

        // clear the refresh token cookie 
        response.clearCookie(
            'refreshToken',
            {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            }
        )

        response.json(
            {
                message: "Refresh cookie cleared!"
            }
        )
    }
)


module.exports= {
    login,
    refresh,
    logout 
}