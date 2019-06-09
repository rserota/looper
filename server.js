const express     = require('express')
// const bcrypt      = require('bcryptjs')
const compression = require('compression') // gzip compression for all responses
const bodyParser  = require('body-parser')
const sessions    = require('client-sessions')

const app          = express()
const gar          = global.appRoot = app.locals.basedir = __dirname
// const mw           = require(`${gar}/routes/middleware`)

var HTTP           = require('http')
var HTTPS          = require('https')
var fs             = require('fs')
module.exports.app = app

// pug setup
app.set('view engine', 'pug')
app.set('views', './public/views')

// app.use(helmet())
app.use(compression())
app.use(express.static('./public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

const sessionMiddleware = sessions({
    cookieName     : 'frivolous-session', // cookie name dictates the key name added to the request object
    secret         : 'thebiz', // should be a large unguessable string
    duration       : 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    // duration       : 2 , // how long the session will stay valid in ms
    activeDuration : 1000 * 60 * 60, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    cookie         : {
        httpOnly : true, // when true, cookie is not accessible from javascript
        secure   : false, // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
    },
})
module.exports.sessionMiddleware = sessionMiddleware
app.use(sessionMiddleware)

// app.use(mw.userInView)

app.use(require('./routes/main.router')) // these routes always return HTML
// app.use(require('./routes/auth.router'))


// require('./routes/errorRoutes')


let server
try {
    var httpsConfig = {
        key: fs.readFileSync('/home/ubuntu/blind-tiger/ssl/privkey1.pem'),
        cert: fs.readFileSync('/home/ubuntu/blind-tiger/ssl/cert1.pem'),
    }

    server = HTTPS.createServer(httpsConfig, app)
    // 443 is the default port for HTTPS traffic
    server.listen(443)
    var httpApp = express()
    httpApp.use(function(req, res, next){
        res.redirect('https://frivolous.biz' + req.url)
    })
    httpApp.listen(80)
    console.log('Started HTTPS Server')
}
catch(e){
    console.log(e)
    console.log('could not start HTTPS server')
    server = HTTP.createServer(app)
    server.listen(80)
}

console.log("NODE_ENV: ", process.env.NODE_ENV)
module.exports.server = server
// require('./socket-server')