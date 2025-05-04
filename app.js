const createError = require('http-errors');
const express = require('express');
const session = require('express-session')
const path = require('path');
const cookieParser = require('cookie-parser')
const logger = require('morgan');
const fs = require("fs");

const { loginRouter, renderLoginPage } = require('./routes/login')
const indexRouter = require('./routes/index')

const dashboardRouter= require('./routes/dashboard')
const uploadRouter = require('./routes/upload')
const galleryUploadRouter = require('./routes/gallery-upload')
const createGalleryRouter = require('./routes/gallery');
const notesRouter = require('./routes/notes')
const workoutRouter = require('./routes/workout')

const implementation = require('./implementation/core.js')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const secondsPerDay = 24 * 60 * 60 * 1000
app.use(session({
  secret: implementation.configuration.sessionSecret,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: {
    maxAge: 90 * secondsPerDay
  }
}))

app.use('/login', loginRouter)

app.use('/', indexRouter);

let galleriesPath = './public/images/galleries'
if (fs.existsSync(galleriesPath))
{
  fs.readdirSync(galleriesPath)
      .forEach(name => app.use('/' + name, createGalleryRouter(name)))
}

app.use('/dashboard', dashboardRouter);

app.use(function (request, response, next) {
  let userId = request.session.userId
  if (userId === undefined) { // TODO path-based permission checks, should be optional
    if (request.method === 'GET') {
      renderLoginPage(request, response, request.path)
    } else {
      response.status(401)
      response.send()
    }
  } else {
    next()
  }
})

app.use('/upload', uploadRouter)
app.use('/gallery-upload', galleryUploadRouter)
app.use('/notes', notesRouter)
app.use('/workout', workoutRouter)

// catch 404 and forward to error handler
app.use(function(request, response, next) {
  console.log("Not found: [" + request.path + "]")
  next(createError(404))
});

// error handler
app.use(function(err, request, response) {
  // set locals, only providing error in development
  response.locals.message = err.message;
  response.locals.error = request.app.get('env') === 'development' ? err : {}

  // render the error page
  response.status(err.status || 500);
  response.render('error')
});

module.exports = app
