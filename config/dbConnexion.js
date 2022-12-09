const mongoose= require('mongoose')

const { logEvents }= require('../middlewares/logger')

const dbConnexion= async()=> {

    try {

        const DATABASE_URI= process.env.DATABASE_URI
        await mongoose.connect(
            DATABASE_URI,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
    } catch (error){
        console.log(error)
    }
}

module.exports= {
    dbConnexion 
}