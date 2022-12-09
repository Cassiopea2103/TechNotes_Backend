require('dotenv').config()

const jwt= require('jsonwebtoken')

const verifyJWT= ( request, response, next )=> {

    // retrieve authorization headers 
    const authHeaders= request.headers.authorization || request.headers.Authorization

    // check Bearer authHeaders ( supports the token ): 
    if ( !authHeaders?.startsWith('Bearer ')){
        return response.status(401).json(
            {
                message: "Unauthorized. You don't have a token!"
            }
        )
    }

    // get the token from authHeaders: 
    const token= authHeaders.split(' ')[1]    

    // verify the token: 
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        ( error, decoded )=> {
            if ( error ){
                return response.status(403).json(
                    {
                        message: `Forbidden! ${ error }`
                    }
                )
            }

            request.user= decoded.userInfo.username 
            request.roles= decoded.userInfo.roles

            next()
        }
    )
}

module.exports= verifyJWT