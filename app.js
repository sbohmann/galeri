const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const session = require('express-session')
const indexRouter = require('./routes/index')
const uploadRouter = require('./routes/upload')
const loginRouter = require('./routes/login')
const fs = require('fs')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(session({
  secret: fs.readFileSync('config/secret.txt', 'utf8')
}))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/login', loginRouter);

app.use(function (request, response, next) {
  let userId = request.session.userId
  if (userId === undefined) {
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
app.use('/upload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log("Error:", err)
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
