const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')
const slugify = require('slugify')

router.get('/new/:objectId', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const objectId = req.params.objectId
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const lists = await models.fkycedLists.findAll()
    const objects = await models.fkycedObjects.findAll()
    res.render('newField', { user: userInfo, objectId: objectId, objects: objects, lists: lists })
  }
})

router.get('/edit/:fieldId', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const fieldId = req.params.fieldId
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const field = await models.fkycedFields.findOne({ where: { id: fieldId } })
    if (field.listValues) field.listValues = JSON.parse(field.listValues)
    const lists = await models.fkycedLists.findAll()
    const objects = await models.fkycedObjects.findAll()
    res.render('editField', { user: userInfo, field: field, objects: objects, lists: lists })
  }
})

router.get('/delete/:fieldId/:objectId', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const fieldId = req.params.fieldId
  const objectId = req.params.objectId
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const field = await models.fkycedFields.findOne({ where: { id : fieldId }})
    try {
      await field.destroy()
      res.redirect('/object/fields/' + objectId)
    } catch (error) {
      const userInfo = await camunda.getUserInfo(user.authenticatedUser)
      const object = await models.fkycedObjects.findOne({ where: { id : objectId }})
      const fields = await models.fkycedFields.findAll({ where: { objectId : objectId }})
      res.render('objectFields', { user: userInfo, object: object, fields: fields, error: error })
    }
  }
})

router.post('/save', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const extraFields = {
      currency: ['length', 'decimal'],
      number: ['length', 'decimal'],
      text: ['unique'],
      picklist: ['listOrValues'],
      picklistMulti: ['listOrValues', 'displayLine'],
      object: ['object']
    }
    const fieldTypeToCamunda = {
      checkbox: 'boolean',
      currency: 'double',
      date: 'date',
      number: 'double',
      object: 'integer',
      phone: 'string',
      picklist: 'json',
      picklistMulti: 'json',
      text: 'string',
      textArea: 'string'
    }
    const fieldId = (typeof req.body.fieldId === 'undefined') ? null : req.body.fieldId
    const { objectId, fieldLabel, fieldName, fieldDescription, fieldHelper,
            fieldDefault, fieldRequired, fieldType, fieldLength, fieldDecimal,
            fieldUnique, fieldListOrValuesCheckbox, fieldListId, fieldValuesList,
            fieldObjectId, fieldDisplayLine
          } = req.body
    const name = (fieldName === '') ? slugify(fieldLabel) : slugify(fieldName)
    const desc = (fieldDescription === '') ? null : fieldDescription
    const helper = (fieldHelper === '') ? null : fieldHelper
    const defaultValue = (fieldDefault === '') ? null : fieldDefault
    const required = (typeof fieldRequired === 'undefined') ? 0 : 1
    let camundaType = null
    _.forEach(fieldTypeToCamunda, function(value, key)
        { if (key === fieldType) { camundaType = value } })
    let valueUnique = 0
    let numLength = null
    let numDecimal = null
    let listId = null
    let listValues = null
    let displayLine = null
    let linkedObjectId = null
    _.forEach(extraFields, function (value, key) {
      if (fieldType === key) {
        _.forEach(value, function (value) {
          switch(value) {
            case 'length':
              numLength = parseInt(fieldLength)
              break
            case 'decimal':
              numDecimal = parseInt(fieldDecimal)
              break
            case 'unique':
              valueUnique = (typeof fieldUnique === 'undefined') ? 0 : 1
              break
            case 'listOrValues':
              if (fieldListOrValuesCheckbox === 'list') {
                listId = fieldListId
              } else if (fieldListOrValuesCheckbox === 'values') {
                listValues = JSON.stringify(fieldValuesList)
              }
              break
            case 'displayLine':
                displayLine = parseInt(fieldDisplayLine)
                break
            case 'object':
                linkedObjectId = fieldObjectId
                break
          }
        })
      }
    })
    if (fieldId) {
      let field = await models.fkycedFields.findOne({ where: { id: fieldId } })
      field.changed('updatedAt', true)
      field.changed('numLength', true)
      field.changed('numDecimal', true)
      field.changed('valueUnique', true)
      field.changed('listId', true)
      field.changed('listValues', true)
      field.changed('displayLine', true)
      field.changed('linkedObjectId', true)
      field.fieldType = fieldType
      field.camundaType = camundaType
      field.label = fieldLabel
      field.name = name
      field.description = desc
      field.helper = helper
      field.required = required
      field.defaultValue = defaultValue
      field.numLength = numLength
      field.numDecimal = numDecimal
      field.valueUnique = valueUnique
      field.listId = listId
      field.listValues = listValues
      field.displayLine = displayLine
      field.linkedObjectId = linkedObjectId
      try {
        const object  = await models.fkycedObjects.findOne({where: {id: objectId}})
        const updatedField = await field.save()
        await updatedField.setObject(object)
        res.redirect('/object/fields/' + objectId)
      } catch (error) {
        const userInfo = await camunda.getUserInfo(user.authenticatedUser)
        const lists = await models.fkycedLists.findAll()
        const objects = await models.fkycedObjects.findAll()
        res.render('newField', { user: userInfo, objectId: objectId, objects: objects, lists: lists, error: error })
      }
    } else {
      try {
        const object  = await models.fkycedObjects.findOne({where: {id: objectId}})
        const newField = await models.fkycedFields.create(
          { objectId: objectId, fieldType : fieldType, camundaType: camundaType,
            label: fieldLabel, name: name, description: desc, helper: helper,
            required: required, defaultValue: defaultValue, numLength: numLength,
            numDecimal: numDecimal, valueUnique: valueUnique, listId: listId,
            listValues: listValues, displayLine: displayLine,
            linkedObjectId: linkedObjectId, valueSize: null
          })
        await newField.setObject(object)
        await object.addFields(newField)
        res.redirect('/object/fields/' + objectId)
      } catch (error) {
        const userInfo = await camunda.getUserInfo(user.authenticatedUser)
        const lists = await models.fkycedLists.findAll()
        const objects = await models.fkycedObjects.findAll()
        res.render('newField', { user: userInfo, objectId: objectId, objects: objects, lists: lists, error: error })
      }
    }
  }
})

module.exports = router
