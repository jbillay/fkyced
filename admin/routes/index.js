const express = require('express')
const router = express.Router()
const camunda = require('../lib/camunda')
const models = require('../models')
const _ = require('lodash')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login')
})

router.post('/login', async function(req, res, next) {
  const username = req.body.username
  const password = req.body.password
  const user = await camunda.authenticateUser(username, password, 'fkycedAdmin')
  res.cookie('currentAdminUser', user, { maxAge: 900000, httpOnly: true })
  if (user) {
    res.redirect('/home')
  } else {
    res.redirect('/')
  }
})

router.get('/logout', async function(req, res, next) {
  res.clearCookie('currentAdminUser', { maxAge: 900000, httpOnly: true })
  res.redirect('/')
})

router.get('/home', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('index', { user: userInfo, title: 'Administration tool' })
  }
})

module.exports = router
