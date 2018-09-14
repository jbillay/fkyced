const request = require('axios')
const _ = require('lodash')
const config = require('../config')

request.defaults.headers.post['Content-Type'] = 'application/json'

const getCurrentProcess = async () => {
  try {
    const response = await request.get(config.adminApi + '/api/currentProcess')
    const processInfo = response.data
    return processInfo
  } catch(error) {
    console.error(error)
  }
}

const getForm = async (id) => {
  try {
    const response = await request.get(config.adminApi + '/api/form?id=' + id)
    if (response.data.status === 'success') {
      const form = response.data.form
      return form
    } else {
      console.error(response.data.error)
    }
  } catch(error) {
    console.error(error)
  }
}

const getListValues = async (id) => {
  try {
    const response = await request.get(config.adminApi + '/api/list/values/' + id)
    if (response.data.status === 'success') {
      const values = response.data.values
      return values
    } else {
      console.error(response.data.error)
    }
  } catch(error) {
    console.error(error)
  }
}

const getListValue = async (listId, id) => {
  try {
    const response = await request.get(config.adminApi + '/api/list/' + listId + '/value/' + id)
    if (response.data.status === 'success') {
      const value = response.data.value
      return value
    } else {
      console.error(response.data.error)
    }
  } catch(error) {
    console.error(error)
  }
}


const getFieldCamundaType = async (attributesList) => {
  try {
    const response = await request.post(config.adminApi + '/api/field/definition', attributesList)
    if (response.data.status === 'success') {
      const values = response.data.values
      return values
    } else {
      console.error(response.data.error)
    }
  } catch(error) {
    console.error(error)
  }
}

module.exports = { getCurrentProcess, getForm, getListValues, getListValue, getFieldCamundaType }
