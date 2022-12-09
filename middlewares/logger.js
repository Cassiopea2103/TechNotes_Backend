const path= require('path')
const fs= require('fs')
const fsPromises= require('fs').promises
const { v4: uuid }= require('uuid')
const { format }= require('date-fns')

const logEvents= async(message, logFile)=> {
    
    const dateTime = format(new Date(), 'dd/ MM/ yyyy\tHH: mm: ss')
    
    const logMessage= `${dateTime}\t${uuid()}\t${message}\n`

    try{

        // create the logs dir if not exists: 
        const logsDir= path.join(__dirname, '../logs')
        
        const logsExists= fs.existsSync(logsDir)
        if (!logsExists){
            await fsPromises.mkdir(logsDir)
        }

        // write the logMessage into the specified file:
        const filePath= path.join(logsDir, logFile) 

        await fsPromises.appendFile(filePath, logMessage)
    
    } catch (error){
        console.log(error)
    }
}

const logger= (request, response, next)=> {

    const message= `${request.method}\t${request.url}\t${request.headers.origin}`

    logEvents(message, 'requestLogs.log')

    console.log(`${request.method}  ${request.path}`)

    next()
    
}

module.exports= {
    logEvents,
    logger
}