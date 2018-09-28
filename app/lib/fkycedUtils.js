const _ = require('lodash')

const getTaskStatusInfo = function (taskId, openTasks, completedTasks) {
  // Completed / In Progress / Not Started
  let statusInfo = {
    status: 'Not Started',
    startDate: null,
    owner: null,
    execId: null
  }
  _.forEach(completedTasks, function(value, key) {
    if (taskId === value.taskDefinitionKey && value.deleteReason === 'completed') {
      statusInfo.status = 'Completed'
      statusInfo.startDate = value.endTime
      statusInfo.owner = value.assignee
      statusInfo.execId = value.id
    } else if (taskId === value.taskDefinitionKey && value.deleteReason === 'deleted') {
      statusInfo.status = 'Refered'
      statusInfo.startDate = value.endTime
      statusInfo.owner = value.assignee
      statusInfo.execId = value.id
    }
  })
  _.forEach(openTasks, function(value, key) {
    if (taskId === value.taskDefinitionKey) {
      statusInfo.status = 'In Progress'
      statusInfo.startDate = value.created
      statusInfo.owner = value.assignee
      statusInfo.execId = value.id
    }
  })
  return statusInfo
}

module.exports = { getTaskStatusInfo }
