const path= require('path')

const homePage= (request, response)=> {
    
    const indexPath= path.join(__dirname, '../views/index.html')

    response.sendFile(indexPath)
}

const notFound= (request, response)=> {

    const notFoundPath= path.join(__dirname, '../views/404.html')

    response.status(404)

    if (request.accepts('html')){
        response.sendFile(notFoundPath)
    } else if (request.accepts('json')){
        response.json({"Not found": "The resources you requested do not exist"})
    } else {
        response.type('txt').send('404 Not Found!')
    }
}

module.exports= {
    homePage,
    notFound
}