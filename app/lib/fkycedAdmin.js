const request = require('axios')
const _ = require('lodash')
const config = require('../config')

request.defaults.headers.post['Content-Type'] = 'application/json'

const getCurrentProcess = async () => {
  try {
    const response = await request.get(config.adminApi + '/currentProcess')
    const processInfo = response.data
    return processInfo
  } catch(error) {
    console.error(error)
  }
}

module.exports = { getCurrentProcess }
