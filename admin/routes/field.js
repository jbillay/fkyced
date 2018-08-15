const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')
const slugify = require('slugify')

router.get('/new/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const objectId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('newField', { user: userInfo, objectId: objectId })
  }
})

router.post('/save', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    res.redirect('/object')
  }
})

module.exports = router
