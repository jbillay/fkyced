const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index')
const formRouter = require('./routes/form')
const apiRouter = require('./routes/api')
const processesRouter = require('./routes/processes')
const listRouter = require('./routes/list')
const objectRouter = require('./routes/object')
const fieldRouter = require('./routes/field')
const evidenceRouter = require('./routes/evidence')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter)
app.use('/form', formRouter)
app.use('/api', apiRouter)
app.use('/processes', processesRouter)
app.use('/list', listRouter)
app.use('/object', objectRouter)
app.use('/field', fieldRouter)
app.use('/evidence', evidenceRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
