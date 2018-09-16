const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')
const slugify = require('slugify')

router.get('/', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const objects = await models.fkycedObjects.findAll()
    res.render('object', { user: userInfo, objects: objects })
  }
})

router.get('/new', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('newObject', { user: userInfo })
  }
})

router.post('/save', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const { objectId, objectLabel, objectName, objectDescription } = req.body
    const name = objectName === '' ? slugify(objectLabel).replace(/-/g, '') : slugify(objectName).replace(/-/g, '')
    if (typeof objectId === 'undefined') {
      try {
        const newObject = await models.fkycedObjects.create(
          { label: objectLabel, name: name, description: objectDescription })
        res.redirect('/object')
      } catch (error) {
        const userInfo = await camunda.getUserInfo(user.authenticatedUser)
        res.render('newObject', { user: userInfo, error: error })
      }
    } else {
      let object = await models.fkycedObjects.findOne({ where: { id : objectId }})
      object.label = objectLabel
      object.name = name
      object.description = objectDescription
      try {
        const updatedObject = await object.save()
        res.redirect('/object')
      } catch (error) {
        const userInfo = await camunda.getUserInfo(user.authenticatedUser)
        const object = await models.fkycedObjects.findOne({ where: { id : objectId }})
        res.render('editObject', { user: userInfo, object: object, error: error })
      }
    }
  }
})

router.get('/delete/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const objectId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const object = await models.fkycedObjects.findOne({ where: { id : objectId }})
    try {
      await models.fkycedFields.destroy({ where: { objectId : objectId }})
      await object.destroy()
      res.redirect('/object')
    } catch (error) {
      const userInfo = await camunda.getUserInfo(user.authenticatedUser)
      const objects = await models.fkycedObjects.findAll()
      res.render('object', { user: userInfo, objects: objects, error: error })
    }
  }
})

router.get('/edit/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const objectId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const object = await models.fkycedObjects.findOne({ where: { id : objectId }})
    res.render('editObject', { user: userInfo, object: object })
  }
})

router.get('/fields/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const objectId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const object = await models.fkycedObjects.findOne({ where: { id : objectId }})
    const fields = await models.fkycedFields.findAll({ where: { objectId : objectId }})
    res.render('objectFields', { user: userInfo, object: object, fields: fields })
  }
})

module.exports = router
