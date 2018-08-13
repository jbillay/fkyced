const express = require('express')
const router = express.Router()
const camunda = require('../lib/camunda')
const models = require('../models')
const _ = require('lodash')

router.get('/', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const forms = await models.fkycedForms.findAll()
    res.render('forms', { user: userInfo, forms: forms })
  }
})

router.get('/delete/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const formId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const forms = await models.fkycedForms.findOne({ where: { id : formId }}).then(function (form) {
      form.destroy()
    })
    res.redirect('/form')
  }
})

router.post('/edit/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const formId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    let form = await models.fkycedForms.findOne({ where: { id : formId }})
    form.formId = req.body.formId
    form.formName = req.body.formName
    form.formStructure = JSON.stringify(req.body.data.replace(/(?:\\[rnt]|[\r\n\t]+)+/g, ""))
    try {
      const newForm = await form.save()
      res.redirect('/form')
    } catch (error) {
      res.render('editForm', { user: userInfo, error: error, form: form })
    }
  }
})

router.get('/edit/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const formId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const form = await models.fkycedForms.findOne({ where: { id : formId }})
    res.render('editForm', { user: userInfo, form: form })
  }
})

router.get('/new', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('newForm', { user: userInfo })
  }
})

router.post('/save', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const formId = req.body.formId
    const formName = req.body.formName
    const formStructure = JSON.stringify(req.body.data.replace(/(?:\\[rnt]|[\r\n\t]+)+/g, ""))
    try {
      const newForm = await models.fkycedForms.create(
        { formName: formName, formId: formId, formStructure: formStructure })
      res.redirect('/form')
    } catch (error) {
      res.render('newForm', { user: userInfo, error: error })
    }
  }
})

module.exports = router
