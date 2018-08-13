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
    const processList = await camunda.getProcessList()
    const currentProcess = await models.processes.findOne({ where: { active: true } })
    const processOnlyList = _.uniqBy(processList, 'key');
    res.render('processes', { user: userInfo, processList: processList,
      currentProcess: currentProcess, processOnlyList: processOnlyList })
  }
})

router.post('/', async function(req, res, next) {
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

module.exports = router
