const request = require('axios')
const _ = require('lodash')
const config = require('../config')

request.defaults.headers.post['Content-Type'] = 'application/json'

const checkUserGroup = async function (userId, groupId) {
  // GET /identity/groups?userId=aUserId
  try {
    const response = await request.get(config.engineApi + '/identity/groups?userId=' + userId)
    const groupList = response.data
    if (groupList && groupList.groups) {
      let member = false
      for (const group in groupList.groups) {
        if (groupList.groups[group].id === groupId) {
          member = true
        }
      }
      return member
    } else {
      return false
    }
  } catch(error) {
    console.error(error)
  }
}

const authenticateUser = async function (username, password, group) {
  // POST /identity/verify
  try {
    const body = {
      username: username,
      password: password
    }
    const response = await request.post(config.engineApi + '/identity/verify', body)
    const user = response.data
    if (user.authenticated) {
      if (group) {
        const groupMember = await checkUserGroup(user.authenticatedUser, group)
        if (groupMember) {
          return user
        } else {
          return null
        }
      } else {
        return user
      }
    } else {
      return null
    }
  } catch(error) {
    console.error(error)
  }
}

const getUserInfo = async userId => {
  // GET /user/{id}/profile
  try {
    const response = await request.get(config.engineApi + '/user/' + userId + '/profile')
    const userInfo = response.data
    return userInfo
  } catch(error) {
    console.error(error)
  }
}

const getProcessList = async () => {
  // GET /process-definition
  try {
    const response = await request.get(config.engineApi + '/process-definition')
    const processInfo = response.data
    const processes = _.map(processInfo, function (process) {
      return { key: process.key, name: process.name, version: process.version }
    })
    return processes
  } catch(error) {
    console.error(error)
  }
}

const searchProcess = async (processName, processVersion) => {
  // GET /process-definition
  try {
    let params = `?key=${processName}`
    if (processVersion === 'latest') {
      params += `&latestVersion=true`
    } else {
      params += `&latestVersion=${parseInt(processVersion)}`
    }
    const response = await request.get(config.engineApi + '/process-definition' + params);
    const process = response.data;
    return process;
  } catch(error) {
    console.error(error);
  }
}

module.exports = { authenticateUser, getUserInfo, getProcessList, searchProcess }
