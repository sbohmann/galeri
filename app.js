const createError = require('http-errors');
const express = require('express');
const session = require('express-session')
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const loginRouter = require('./routes/login')
const indexRouter = require('./routes/index');

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

app.use(session({
  secret: implementation.configuration.sessionSecret,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId'
}))

app.use('/login', loginRouter)

app.use(function (request, response, next) {
  let userId = request.session.userId
  if (userId === undefined) { // TODO path-based permission checks, should be optional
    if (request.method === 'GET') {
      response.status(302)
      response.set('Location', '/login')
      response.send()
    } else {
      response.status(401)
      response.send()
    }
  } else {
    next()
  }
})

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(request, response, next) {
  next(createError(404));
});

// error handler
app.use(function(err, request, response, next) {
  // set locals, only providing error in development
  response.locals.message = err.message;
  response.locals.error = request.app.get('env') === 'development' ? err : {};

  // render the error page
  response.status(err.status || 500);
  response.render('error');
});

module.exports = app;
