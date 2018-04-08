require('dotenv').config()
const Koa = require('koa')
const _ = require('koa-route')
const static = require('koa-static')
const bodyParser = require('koa-bodyparser')
const oauth = require('./oauth')

const app = new Koa()


// Parse the body when a game is posted to "/save" (the "Share" link is clicked)
app.use(bodyParser())

oauth(app)
// Serve static files from the main directory
app.use(static('./'))


// Start up the webserver
app.listen(process.env['PORT'] || 3000)
