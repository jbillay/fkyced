const request = require('axios')
const parseString = require('xml2js').parseString
const _ = require('lodash')
const config = require('../config')

request.defaults.headers.post['Content-Type'] = 'application/json';

const searchProcess = async (processName, processVersion) => {
  // GET /process-definition
  try {
    const response = await request.get(config.engineApi + '/process-definition');
    const data = response.data;
    const process = _.find(data, { 'key': processName, 'version': processVersion });
    return process;
  } catch(error) {
    console.error(error);
  }
}

const getProcessDefinition = async processInstanceId => {
  // GET /process-instance/{id} or GET /history/process-instance/{id}
  try {
    const response = await request.get(config.engineApi + '/history/process-instance/' + processInstanceId);
    const processInfo = response.data
    return processInfo
  } catch(error) {
    console.error(error)
  }
}

const getInstanceHistory = async processDefinitionId => {
  // GET /history/process-instance/
  try {
    const response = await request.get(config.engineApi + '/history/process-instance?processDefinitionId=' + processDefinitionId);
    const executedProcesses = response.data
    return executedProcesses
  } catch(error) {
    console.error(error);
  }
}

const getInstanceTaskHistory = async processInstanceId => {
  // GET /history/task?processInstanceId=
  try {
    const response = await request.get(config.engineApi + '/history/task?processInstanceId=' + processInstanceId);
    const taskHistoryList = response.data
    return taskHistoryList
  } catch(error) {
    console.error(error);
  }
}

const getStartFormKey = async processId => {
  // GET /process-definition/{id}/startForm
  try {
    const response = await request.get(config.engineApi + '/process-definition/' + processId + '/startForm');
    const formKey = response.data
    return formKey;
  } catch(error) {
    console.error(error);
  }
}

const getStartFormVariables = async processId => {
  // GET /process-definition/{id}/form-variables
  try {
    const response = await request.get(config.engineApi + '/process-definition/' + processId + '/form-variables');
    const formVariables = response.data
    return formVariables;
  } catch(error) {
    console.error(error);
  }
}

const getProcessXML = async processId => {
  // GET /process-definition
  try {
    const response = await request.get(config.engineApi + '/process-definition/' + processId + '/xml');
    const xml = response.data.bpmn20Xml;
    return xml;
  } catch(error) {
    console.error(error);
  }
}

const getInstances = async processId => {
  try {
    const response = await request.get(config.engineApi + '/process-instance?processDefinitionId=' + processId);
    const data = response.data;
    return data;
  } catch(error) {
    console.error(error);
  }
}

const startProcess = async processId => {
  try {
    const response = await request.post(config.engineApi + '/process-definition/' + processId + '/start');
    const data = response.data;
    return data;
  } catch(error) {
    console.error(error);
  }
}

const submitStartForm = async (processId, variables)  => {
  try {
    const response = await request.post(config.engineApi +
      '/process-definition/' + processId + '/submit-form', variables);
    const data = response.data;
    return data;
  } catch(error) {
    console.error(error);
  }
}

const getOpenTasks = async processInstanceId => {
  // GET /task?assignee=anAssignee&delegationState=RESOLVED&maxPriority=50
  try {
    const response = await request.get(config.engineApi + '/task?processInstanceId=' + processInstanceId);
    const tasks = response.data;
    return tasks;
  } catch(error) {
    console.error(error);
  }
}

const getFormVariable = async taskId => {
  // GET /task/{id}/form-variables
  try {
    const response = await request.get(config.engineApi + '/task/' + taskId + '/form-variables');
    const variables = response.data;
    return variables;
  } catch(error) {
    console.error(error);
  }
}

const getRenderedForm = async taskId => {
  // GET /task/{id}/rendered-form
  try {
    const response = await request.get(config.engineApi + '/task/' + taskId + '/rendered-form');
    const htmlForm = response.data;
    return htmlForm;
  } catch(error) {
    console.error(error);
  }
}

const getTask = async taskId => {
  try {
    const response = await request.get(config.engineApi + '/task/' + taskId);
    const task = response.data;
    return task;
  } catch(error) {
    console.error(error);
  }
}

const getCompletedTask = async taskId => {
  try {
    const response = await request.get(config.engineApi + '/history/task?taskId=' + taskId)
    const task = response.data[0]
    return task
  } catch(error) {
    console.error(error)
  }
}

const getProcessVariables = async processId => {
  try {
    const response = await request.get(config.engineApi + '/variable-instance?processInstanceIdIn=' + processId);
    const variables = response.data;
    return variables
  } catch(error) {
    console.error(error)
    Promise.reject(error)
  }
}

const getHistoryVariableInstance = async processId => {
  try {
    const response = await request.get(config.engineApi + '/history/variable-instance?processInstanceIdIn=' + processId);
    const variables = response.data;
    return variables
  } catch(error) {
    console.error(error)
    Promise.reject(error)
  }
}

const buildTaskVariables = (workflowData, taskData) => {
  _.map(workflowData, function(values, key) {
    if (taskData[key]) {
      if (values.type === 'Long') { workflowData[key] = { value: parseInt(taskData[key]) } }
      if (values.type === 'String') { workflowData[key] = { value: taskData[key] } }
      if (values.type === 'Boolean') { workflowData[key] = { value: true } }
      if (values.type === 'Date') { workflowData[key] = { value: taskData[key] } }
      if (values.type === 'Enum') { workflowData[key] = { value: taskData[key] } }
    } else {
      if (values.value) {
        workflowData[key] = { value: values.value }
      } else {
        if (values.type === 'Boolean') {
          workflowData[key] = { value: false }
        } else {
          workflowData[key] = { value: null } }
      }
    }
  })
  return workflowData
}

const completeTask = async (taskId, variables) => {
  // POST /task/anId/complete
  try {
    const response = await request.post(config.engineApi + '/task/' + taskId + '/complete', variables)
  } catch(error) {
    // Promise.reject(error)
    console.error(error);
  }
}

const setAssignee = async (taskId, userId) => {
  // POST /task/{id}/assignee
  try {
    const user = {'userId': userId}
    const response = await request.post(config.engineApi + '/task/' + taskId + '/assignee', user)
  } catch(error) {
    // Promise.reject(error)
    console.error(error);
  }
}

const getUserInfo = async userId => {
  // GET /user/{id}/profile
  try {
    const response = await request.get(config.engineApi + '/user/' + userId + '/profile')
    const userInfo = response.data
    return userInfo
  } catch(error) {
    console.error(error);
  }
}

const verifyUserIdentity = async (username, password) => {
  // POST /identity/verify
  try {
    const body = {
      username: username,
      password: password
    }
    const response = await request.post(config.engineApi + '/identity/verify', body);
    const user = response.data;
    if (user.authenticated) {
      return user;
    } else {
      return null
    }
  } catch(error) {
    console.error(error);
  }
}

const getTaskInfo = taskInfo => {
  const task = {}
  task.type = 'task'
  task.id = taskInfo['$'].id
  task.name = taskInfo['$'].name
  task.form = taskInfo['$']['camunda:formKey']
  if (taskInfo['bpmn:extensionElements']) {
    const taskProperties = taskInfo['bpmn:extensionElements'][0]['camunda:properties'][0]['camunda:property']
    for (const [taskPropertyKey, taskPropertyInfo] of Object.entries(taskProperties)) {
      const propertyName = taskPropertyInfo['$'].name
      const propertyValue = taskPropertyInfo['$'].value
      task[propertyName] = propertyValue
    }
  }
  return (task)
}

const getSubProcessInfo = subProcessInfo => {
  const subProcess = {}
  subProcess.type = 'subProcess'
  subProcess.id = subProcessInfo['$'].id
  subProcess.name = subProcessInfo['$'].name
  subProcess.tasks = []
  for (const [subProcessTaskKey, subProcessTaskInfo] of Object.entries(subProcessInfo)) {
    if (subProcessTaskKey === 'bpmn:userTask') {
      for (const [taskKey, taskInfo] of Object.entries(subProcessTaskInfo)) {
        subProcess.tasks.push(getTaskInfo(taskInfo))
      }
    }
  }
  return subProcess
}

// TODO: Build the structure based on the Sequence Flows
const getProcessStructure = async xml => {
  return new Promise(function(resolve, reject) {
      parseString(xml, function (err, result) {
        if (err) {
          reject(err)
        } else {
          let processStructure = {}
          const overallStructure = result['bpmn:definitions']['bpmn:process'][0]
          processStructure.name = overallStructure['$'].name
          processStructure.id = overallStructure['$'].id
          processStructure.structure = []
          for (const [objectKey, objectInfo] of Object.entries(overallStructure)) {
            if (objectKey === 'bpmn:subProcess') {
              for (const [subProcessKey, subProcessInfo] of Object.entries(objectInfo)) {
                processStructure.structure.push(getSubProcessInfo(subProcessInfo))
              }
            } else if (objectKey === 'bpmn:userTask') {
              for (const [taskKey, taskInfo] of Object.entries(objectInfo)) {
                processStructure.structure.push(getTaskInfo(taskInfo))
              }
            }
          }
          resolve(processStructure)
        }
      })
    }
  );
}

const getTaskForm = (structure, taskId) => {
  let form = null
  for (const [structureKey, structureInfo] of Object.entries(structure)) {
    if (structureInfo.type === 'subProcess') {
      for (const [taskKey, taskInfo] of Object.entries(structureInfo.tasks)) {
          if (taskInfo.id === taskId) {
            form = taskInfo.form
          }
      }
    }
  }
  return form
}

module.exports = {  searchProcess,
                    getProcessDefinition,
                    getInstanceHistory,
                    getInstanceTaskHistory,
                    getProcessXML,
                    getStartFormKey,
                    getStartFormVariables,
                    startProcess,
                    submitStartForm,
                    buildTaskVariables,
                    getOpenTasks,
                    getFormVariable,
                    getProcessVariables,
                    getHistoryVariableInstance,
                    getTask,
                    getTaskForm,
                    getCompletedTask,
                    getRenderedForm,
                    completeTask,
                    setAssignee,
                    getInstances,
                    getUserInfo,
                    verifyUserIdentity,
                    getProcessStructure }
