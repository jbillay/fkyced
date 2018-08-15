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
    const lists = await models.fkycedLists.findAll()
    res.render('list', { user: userInfo, lists: lists })
  }
})

router.get('/edit/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const lists = await models.fkycedLists.findAll()
    const list = await models.fkycedLists.findOne({ where: { id : listId }})
    const values = JSON.parse(list.valueList)
    res.render('editList', { user: userInfo, list: list, values: values, lists: lists })
  }
})

router.post('/edit/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    let list = await models.fkycedLists.findOne({ where: { id : listId }})
    const values = JSON.parse(list.valueList)
    list.name = req.body.listName
    list.parentId = (req.body.listParentId === '') ? null : req.body.listParentId
    list.sorted = (typeof req.body.listSorted === 'undefined') ? false : true
    try {
      const newList = await list.save()
      res.redirect('/list')
    } catch (error) {
      const userInfo = await camunda.getUserInfo(user.authenticatedUser)
      const list = await models.fkycedLists.findOne({ where: { id : listId }})
      const values = JSON.parse(list.valueList)
      const lists = await models.fkycedLists.findAll()
      res.render('editList', { user: userInfo, error: error, list: list, list: lists, values: values })
    }
  }
})

router.get('/delete/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const list = await models.fkycedLists.findOne({ where: { id : listId }})
    await list.destroy()
    res.redirect('/list')
  }
})

router.get('/new', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const lists = await models.fkycedLists.findAll()
    res.render('newList', { user: userInfo, lists: lists })
  }
})

router.post('/save', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const { listName, listParentId, listValues, listSorted } = req.body
    const parentId = (listParentId === '') ? null : listParentId
    const sorted = (typeof listSorted === 'undefined') ? false : true
    let identifier = 0
    let valueList = {}
    listValues.replace(/\r\n/g,'\n').split(/\n/).forEach((value, index) => {  valueList[index] = value } )
    const newList = await models.fkycedLists.create(
      { name: listName, parentId: parentId, valueList: JSON.stringify(valueList), sorted: sorted })
    res.redirect('/list')
  }
})

router.get('/value/edit/:listId/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.listId
  const valueId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const list = await models.fkycedLists.findOne({ where: { id : listId }})
    const values = JSON.parse(list.valueList)
    const value = { id: valueId, name: values[valueId] }
    res.render('editListValue', { user: userInfo, list: list, value: value })
  }
})

router.post('/value/edit/:listId', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.listId
  const valueName = req.body.listValueName
  const valueId = req.body.listValueId
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const list = await models.fkycedLists.findOne({ where: { id : listId }})
    let values = JSON.parse(list.valueList)
    values[valueId] = valueName
    list.valueList = JSON.stringify(values)
    try {
      const newList = await list.save()
      res.redirect('/list/edit/' + listId)
    } catch (error) {
      const userInfo = await camunda.getUserInfo(user.authenticatedUser)
      const lists = await models.fkycedLists.findAll()
      res.render('editList', { user: userInfo, error: error, list: list, list: lists, values: values })
    }
  }
})

router.get('/value/new/:listId', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.listId
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const list = await models.fkycedLists.findOne({ where: { id : listId }})
    res.render('newListValue', { user: userInfo,list: list })
  }
})

router.post('/value/new/:listId', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const listId = req.params.listId
  const valueName = req.body.listValueName
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const list = await models.fkycedLists.findOne({ where: { id : listId }})
    let values = JSON.parse(list.valueList)
    const nextId = parseInt(_.max(Object.keys(values))) + 1
    values[nextId] = valueName
    list.valueList = JSON.stringify(values)
    try {
      const newList = await list.save()
      res.redirect('/list/edit/' + listId)
    } catch (error) {
      const userInfo = await camunda.getUserInfo(user.authenticatedUser)
      const lists = await models.fkycedLists.findAll()
      res.render('editList', { user: userInfo, error: error, list: list, list: lists, values: values })
    }
  }
})

module.exports = router
