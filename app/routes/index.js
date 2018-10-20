const express = require('express')
const router = express.Router()
const camunda = require('../lib/camunda')
const fkycedAdmin  =require('../lib/fkycedAdmin')
const formBuilder = require('../lib/formBuilder')
const fkycedUtils  =require('../lib/fkycedUtils')
const _ = require('lodash')
const moment = require('moment')

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
    if (currentProcess.status === 'error') {
      res.render('error', { user: userInfo, message: currentProcess.error, title: 'Home Page' })
    } else if (currentProcess.status === 'success') {
      const processDefinition = await camunda.searchProcess(currentProcess.key, currentProcess.version)
      if (processDefinition && processDefinition.id) {
        const processInstancesActivity = await camunda.getInstanceHistory(processDefinition.id)
        _.map(processInstancesActivity, function (process)
              { return process.since = moment().fromNow(process.startTime) })
        let inflightProcessList = []
        let completedProcessList = []
        await Promise.all(processInstancesActivity.map(async function (process) {
          const variables = await camunda.getHistoryVariableInstance(process.id)
          if (process.state === 'COMPLETED') {
            variables.forEach(function (variable) {
              process[variable.name] = variable.value
            })
            completedProcessList.push(process)
          } else if (process.state === 'ACTIVE') {
            const openTaskList = await camunda.getOpenTasks(process.id)
            if (openTaskList[0] && openTaskList[0].name) {
              process.currentTask = openTaskList[0].name
            } else {
              process.currentTask = 'System Task'
            }
            variables.forEach(function (variable) {
              process[variable.name] = variable.value
            })
            inflightProcessList.push(process)
          }
        }))
        res.render('index', { user: userInfo, inflightProcess: inflightProcessList,
                              completedProcess: completedProcessList, currentProcess: currentProcess,
                              title: 'Home Page' })
      } else {
        res.render('error', { user: userInfo, message: 'Process not found', title: 'Home Page' })
      }
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
      const processInstance = await camunda.startProcess(processDefinition.id)
      const openTaskList = await camunda.getOpenTasks(processInstance.id)
      if (openTaskList && openTaskList[0]) {
        res.redirect('/displayTask/' + openTaskList[0].id)
      } else {
        res.redirect('/taskList/' + processInstance.id)
      }
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
    const processInstanceId = req.params.processInstanceId
    const processInfo = await camunda.getProcessDefinition(processInstanceId)
    const xml = await camunda.getProcessXML(processInfo.processDefinitionId)
    const processStructure = await camunda.getProcessStructure(xml)
    const openTaskList = await camunda.getOpenTasks(processInstanceId)
    let previousTaskList = openTaskList
    if (openTaskList.length > 0) {
      previousTaskList = await camunda.getPreviousTaskList(processInstanceId, openTaskList[0].taskDefinitionKey, null)
    }
    let completedTaskList = await camunda.getInstanceTaskHistory(processInstanceId)
    completedTaskList = _.filter(completedTaskList, function(o) { return !(o.endTime===null) })
    _.forEach(processStructure.structure, function(value, key) {
      if (value.type === 'subProcess') {
        const nbTasks = value.tasks.length
        let isStarted = false
        let nbCompletedTasks = 0
        _.forEach(value.tasks, function(taskValue, taskKey) {
          const statusInfo = fkycedUtils.getTaskStatusInfo(taskValue.id, openTaskList, completedTaskList)
          taskValue = Object.assign(taskValue, statusInfo)
          if (statusInfo.status === 'In Progress') {
            isStarted = true
          } else if (statusInfo.status === 'Completed') {
            isStarted = true
            nbCompletedTasks++
          }
        })
        if (nbTasks === nbCompletedTasks) {
          value.status = 'Completed'
        } else if (isStarted) {
          value.status = 'In Progress'
        } else {
          value.status = 'Not Started'
        }
      } else if (value.type === 'task') {
        const statusInfo = fkycedUtils.getTaskStatusInfo(value.id, openTaskList, completedTaskList)
        value = Object.assign(value, statusInfo)
      }
    })
    res.render('taskList', {  user: userInfo, processStatus: processStructure.structure,
                              processInstance: processInstanceId, previousTaskList: previousTaskList,
                              title: 'Process Overview'})
  }
})

router.get('/displayCompletedTask/:taskId', async function (req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const taskId = req.params.taskId
    const task = await camunda.getCompletedTask(taskId)
    const xml = await camunda.getProcessXML(task.processDefinitionId)
    const processStructure = await camunda.getProcessStructure(xml)
    task.formKey = camunda.getTaskForm(processStructure.structure, task.taskDefinitionKey)
    if (task.formKey) {
      const form = await fkycedAdmin.getForm(task.formKey)
      const datas = await camunda.getProcessVariables(task.processInstanceId)
      res.render('taskCompletedTasksDisplay', {  user: userInfo, form: form, task: task, title: task.name , currentVariables: datas })
    } else {
      res.redirect('/taskList/' + task.processInstanceId)
    }
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
    if (task.formKey) {
      let error = null
      const form = await fkycedAdmin.getForm(task.formKey)
      if (form === null) {
        error = 'Form not found !'
      }
      const datas = await camunda.getProcessVariables(task.processInstanceId)
      const previousTasks = await camunda.getPreviousTaskList(task.processInstanceId, task.taskDefinitionKey, null)
      res.render('taskDisplayExtForm', { user: userInfo, form: form, task: task, title: task.name,
                                          currentVariables: datas, error: error, previousTasks: previousTasks })
    } else {
      res.redirect('/taskList/' + task.processInstanceId)
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
    let workflowData = req.body
    delete workflowData.refId
    const fieldsInfo = await fkycedAdmin.getFieldCamundaType(Object.keys(workflowData))
    await Promise.all(Object.keys(workflowData).map(async function (key, index) {
      const fieldInfo = _.find(fieldsInfo, {'name': key})
      const camundaType = fieldInfo ? fieldInfo.camundaType : null
      const fieldType = fieldInfo ? fieldInfo.fieldType : null
      if (fieldType === 'picklist') {
        const keyValue = `${key}Value`
        const keyValueValue = await fkycedAdmin.getListValue(fieldInfo.listId, workflowData[key])
        workflowData[keyValue] = {value: keyValueValue}
      }
      workflowData[key] = {value: workflowData[key]}
    }))
    const variables = { variables : workflowData }
    await camunda.setAssignee(taskId, userInfo.id)
    await camunda.completeTask(taskId, variables)
    res.redirect('/taskList/' + task.processInstanceId)
  }
})

router.post('/refer/task', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const targetTaskId = req.body.taskId
    const processId = req.body.processId
    const currentTaskId = await camunda.getCurrentTaskActivityId(processId)
    await camunda.referToSpecificTask(processId, currentTaskId, targetTaskId)
    res.redirect('/taskList/' + processId)
  }
})

router.post('/refer/previous', async function(req, res, next) {
  const user = req.cookies.currentUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const processId = req.body.processId
    const currentTaskId = await camunda.getCurrentTaskActivityId(processId)
    const previousTaskList = await camunda.getPreviousTaskList(processId, currentTaskId, null)
    if (previousTaskList.length > 0) {
      const targetTaskId = previousTaskList[previousTaskList.length - 1].id
      await camunda.referToSpecificTask(processId, currentTaskId, targetTaskId)
      res.redirect('/taskList/' + processId)
    } else {
      res.redirect('/taskList/' + processId)
    }
  }
})

module.exports = router;
