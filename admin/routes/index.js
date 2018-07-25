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

router.get('/processes', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const processList = await camunda.getProcessList()
    const currentProcess = await models.processes.findOne({ where: { active: true } })
    const processOnlyList = _.uniqBy(processList, 'key');
    res.render('processes', { user: userInfo, processList: processList,
      currentProcess: currentProcess, processOnlyList: processOnlyList })
  }
})

router.post('/processes', async function(req, res, next) {
  const processKey = req.body.processSelected
  const processVersion = req.body.versionSelected
  const selectProcess = await camunda.searchProcess(processKey, processVersion)
  let processName = ''
  if (selectProcess && selectProcess[0]) {
    processName = selectProcess[0].name
  } else {
    processName = processKey
  }
  const activeProcess = await models.processes.findOne({ where: { active: true } })
  if (activeProcess) {
    activeProcess.active = false
    activeProcess.inactiveSince = new Date()
    const oldProcess = await activeProcess.save()
  }
  const currentProcess = await models.processes.create(
    { processKey: processKey, processName: processName, processVersion: processVersion })
  res.redirect('/processes')
})

router.get('/api/currentProcess', async function (req, res, next) {
  const activeProcess = await models.processes.findOne({ where: { active: true } })
  const currentProcess = await camunda.searchProcess(activeProcess.processKey, activeProcess.processVersion)
  res.json({ key: currentProcess[0].key, version: currentProcess[0].version })
})

router.get('/forms', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const forms = await models.fkycedForms.findAll()
    res.render('forms', { user: userInfo, forms: forms })
  }
})

router.get('/newForm', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('newForm', { user: userInfo })
  }
})

router.post('/saveForm', async function(req, res, next) {
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
      res.redirect('/forms')
    } catch (error) {
      res.render('newForm', { user: userInfo, error: error })
    }
  }
})

router.get('/api/form', async function (req, res, next) {
  const formId = req.query.id
  if (formId) {
    try {
      const form = await models.fkycedForms.findOne({ where: { formId: formId } })
      res.json({ status: 'success', form: form })
    } catch (error) {
      res.json({ status: 'error', msg: error })
    }
  }
})


module.exports = router
