const rateLimit= require('express-rate-limit')

const { logEvents }= require('./logger')

const loginLimiter= rateLimit( 
    {
        windowMs: 60 * 1000, // 1 minute
        max: 5, // max login attempts per window per minute 
        message: {
            message: 'Too much login attempts. Please retry in 1 minute.'
        },
        handlers: (request, response, next, options)=> {
            
            const errorMessage= `Too many requests: ${options.message.message}\t
            ${request.method}\t${request.url}\t${request.headers.origin}`
            logEvents(errorMessage, 'loginErrors.log')
            response.status(options.statusCode).send(options.message)
        },
        legacyHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        standardHeaders: false // Disable the X-RateLimit-* headers 
    }
)

module.exports= loginLimiter