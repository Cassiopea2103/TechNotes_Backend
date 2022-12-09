// app definition: 
require('dotenv').config()
const express= require('express')
const app= express()

// core modules: 
const path= require('path')

// middlewares: 
const cookieParser= require('cookie-parser')
const cors= require('cors')
const { corsOptions }= require('./config/corsOptions')
const { logger, logEvents }= require('./middlewares/logger')
const { errorHandler }= require('./middlewares/errorHandler')

// MongoDb database connexion: 
const { dbConnexion }= require('./config/dbConnexion')
const mongoose= require('mongoose')

const PORT= process.env.PORT || 3500

// connexion to the database: 
dbConnexion()

// Middlewares: 
// static middleware 
app.use('/', express.static(path.join(__dirname, 'public')))

//c cookies middleware: 
app.use(cookieParser())  

//json middleware:
app.use(express.json())

// cors middleware: 
app.use(cors(corsOptions))

// logger middleware: 
app.use(logger)

// views: 
app.use('/', require('./routes/rootRoutes'))

// API routes: 
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'))
app.use('/notes', require('./routes/noteRoutes'))

// 
app.all('*', require('./routes/rootRoutes'))

// error Handler middleware: 
app.use(errorHandler)

mongoose.connection.once(
    'open', 
    ()=> {
        console.log('Connected to MongoDB')
        app.listen(
            PORT,
            ()=> {
                console.log(`Started the server on PORT ${PORT}`)
            }
        )
    }
)

mongoose.connection.on(
    'error',
    (error)=> {
        const errMsg= `${error.no}: ${error.code}: ${error.syscall}: ${error.hostname}`
        logEvents(errMsg, 'mongoErrorLog.log')
    }
)