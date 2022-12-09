const { logEvents }= require('./logger')

const errorHandler= (error ,request, response, next)=> {

    const logMessage= `${error.name}: ${error.message}\t ${request.method}\t${request.url}
    \t${request.headers.origin}`

    logEvents(logMessage, 'errorLog.log')

    console.log(error.stack)

    const status= response.statusCode
                ? response.statusCode 
                : 500
    
    response.json(
        {
            "Message": error.message,
            isError: true
        }
    )

    next()
}

module.exports= { errorHandler }