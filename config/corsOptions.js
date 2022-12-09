const { allowedOrigins }= require('./allowedOrigins')

const corsOptions= {
    origin: ( origin, callback )=> {
    
        const valid= allowedOrigins.indexOf(origin) !== 1 || !origin 

        if (valid){
            callback(null, true)
        }
        else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    
    credentials: true, 
    optionsSuccessStatus: 200
}

module.exports= { corsOptions }