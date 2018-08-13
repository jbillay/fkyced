const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')

router.get('/', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('object', { user: userInfo })
  }
})

module.exports = router
