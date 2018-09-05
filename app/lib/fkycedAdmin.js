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
      Promise
      console.error(response.data.error)
    }
  } catch(error) {
    console.error(error)
  }
}

module.exports = { getCurrentProcess, getForm }
