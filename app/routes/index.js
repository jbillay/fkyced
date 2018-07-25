const express = require('express')
const router = express.Router()
const camunda = require('../lib/camunda')
const fkycedAdmin  =require('../lib/fkycedAdmin')
const formBuilder = require('../lib/formBuilder')
const _ = require('lodash')

router.get('/', async function(req, res, next) {
    res.render('login')
})

router.post('/login', async function(req, res, next) {
  const username = req.body.username
  const password = req.body.password
  const user = await camunda.verifyUserIdentity(username, password)
  res.cookie('currentUser', user, { maxAge: 900000, httpOnly: true })
  if (user) {
    res.redirect('/home')
  } else {
    res.redirect('/')
  }
})

router.get('/logout', async function(req, res, next) {
  res.clearCookie('currentUser', { maxAge: 900000, httpOnly: true })
  res.redirect('/')
})

router.get('/home', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const currentProcess = await fkycedAdmin.getCurrentProcess()
    const processDefinition = await camunda.searchProcess(currentProcess.key, currentProcess.version)
    if (processDefinition && processDefinition.id) {
      const processInstancesActivity = await camunda.getInstanceHistory(processDefinition.id)
      _.map(processInstancesActivity, function (process)
            { return process.durationInMillis = parseInt(process.durationInMillis) / 60000 })
      res.render('index', { user: userInfo, processes: processInstancesActivity, currentProcess: currentProcess, title: 'Home Page' })
    } else {
      res.render('error', { user: userInfo, message: 'Process not found', title: 'Home Page' })
    }
  }
})

router.get('/processInstance/:name/:version', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const name = req.params.name;
    const version = parseInt(req.params.version);
    const processDefinition = await camunda.searchProcess(name, version);
    const processInstances = await camunda.getInstances(processDefinition.id);
    res.render('instanceList', { user: userInfo, instances: processInstances })
  }
})

router.get('/startProcess/:name/:version', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const name = req.params.name
    const version = parseInt(req.params.version)
    const processDefinition = await camunda.searchProcess(name, version)
    const initForm = await camunda.getStartFormKey(processDefinition.id)
    if (initForm.key) {
      const xml = await camunda.getProcessXML(processDefinition.id);
      const builtForm = await formBuilder.createByTaskType(xml, 'bpmn:startEvent', processDefinition.id, '/submitStartForm');
      res.render('taskDisplayIntForm', { user: userInfo, form: builtForm, title: 'Start Process' });
    } else {
      const processInstance = await camunda.startProcess(processDefinition.id);
      res.redirect('/taskList/' + processInstance.id);
    }
  }
})

router.post('/submitStartForm', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const procesId = req.body.refId
    const formFields = await camunda.getStartFormVariables(procesId)
    const workflowData = camunda.buildTaskVariables(formFields, req.body)
    const variables = { variables : workflowData }
    const processInstance = await camunda.submitStartForm(procesId, variables);
    res.redirect('/taskList/' + processInstance.id);
  }
})

router.post('/startProcess', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const currentProcess = await fkycedAdmin.getCurrentProcess()
    const processDefinition = await camunda.searchProcess(currentProcess.key, currentProcess.version)
    const processInstance = await camunda.startProcess(processDefinition.id)
    res.redirect('/taskList/' + processInstance.id)
  }
})

router.get('/taskList/:processInstanceId', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const processInstanceId = req.params.processInstanceId;
    const taskList = await camunda.getOpenTasks(processInstanceId);
    let taskHistoryList = await camunda.getInstanceTaskHistory(processInstanceId)
    taskHistoryList = _.filter(taskHistoryList, function(o) { return !(o.endTime===null) })
    res.render('taskList', { user: userInfo,
                              tasks: taskList, taskHistory: taskHistoryList,
                              title: 'Task List', processInstance: processInstanceId })
  }
})

router.get('/displayTask/:taskId', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const taskId = req.params.taskId
    const task = await camunda.getTask(taskId)
    const xml = await camunda.getProcessXML(task.processDefinitionId)
    const builtForm = await formBuilder.createByTaskId(xml, task.taskDefinitionKey, taskId)
    if (builtForm.type === 'internal') {
      res.render('taskDisplayIntForm', { user:userInfo, form: builtForm.form, title: task.name })
    } else if (builtForm.type === 'external') {
      const form = await fkycedAdmin.getForm(builtForm.form)
      res.render('taskDisplayExtForm', { user:userInfo, form: form, task: task, title: task.name })
    }
  }
})

router.post('/completeTask/', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const taskId = req.body.refId
    const task = await camunda.getTask(taskId)
    const formFields = await camunda.getFormVariable(taskId)
    const workflowData = camunda.buildTaskVariables(formFields, req.body)
    const variables = { variables : workflowData }
    await camunda.completeTask(taskId, variables)
    res.redirect('/taskList/' + task.processInstanceId)
  }
})

module.exports = router;
