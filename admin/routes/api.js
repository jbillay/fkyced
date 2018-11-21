const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')
const cors = require('cors')
const Sequelize   = require('sequelize')
const Op = Sequelize.Op

router.get('/currentProcess', cors(), async function (req, res, next) {
  const activeProcess = await models.fkycedProcesses.findOne({ where: { active: true } })
  if (activeProcess) {
    const currentProcess = await camunda.searchProcess(activeProcess.processKey, activeProcess.processVersion)
    res.json({ status: 'success', key: currentProcess[0].key, version: currentProcess[0].version })
  } else {
    res.json({ status: 'error', error: 'No process found !' })
  }
})

router.get('/form', cors(), async function (req, res, next) {
  const formId = req.query.id
  if (formId) {
    try {
      const form = await models.fkycedForms.findOne({ where: { formId: formId } })
      res.json({ status: 'success', form: form })
    } catch (error) {
      res.json({ status: 'error', msg: error })
    }
  }
})

router.get('/list/values/:id', cors(), async function (req, res, next) {
  const listId = req.params.id
  if (listId) {
    try {
      const list = await models.fkycedLists.findOne({ where: { id: listId } })
      const values = JSON.parse(list.valueList)
      res.json({ status: 'success', values: values })
    } catch (error) {
      res.json({ status: 'error', msg: error })
    }
  } else {
    res.json({ status: 'error', msg: 'List id is required !' })
  }
})

router.get('/list/:listId/value/:id', cors(), async function (req, res, next) {
  const listId = req.params.listId
  const valueId = req.params.id
  if (listId && valueId) {
    try {
      const list = await models.fkycedLists.findOne({ where: { id: listId } })
      const values = JSON.parse(list.valueList)
      const value = values[valueId]
      res.json({ status: 'success', value: value })
    } catch (error) {
      res.json({ status: 'error', msg: error })
    }
  } else {
    res.json({ status: 'error', msg: 'List id and value id are required !' })
  }
})

router.post('/field/definition', cors(), async function (req, res, next) {
  const fieldList = req.body
  if (fieldList) {
    try {
      const fieldsInfo = await models.fkycedFields.findAll({ where: { name: fieldList } })
      res.json({ status: 'success', values: fieldsInfo })
    } catch (error) {
      res.json({ status: 'error', msg: error })
    }
  }
})

router.post('/evidence/', cors(), async function (req, res, next) {
  let evidenceList = null
  if (req.body && req.body.list) {
    const rawEvidenceList = req.body.list
    evidenceList = JSON.parse(rawEvidenceList)
  }
  if (evidenceList) {
    const evidenceIds = _.map(evidenceList, 'id')
    try {
      const evidences = await models.fkycedEvidences.findAll({ where: { id: { [Op.in]: evidenceIds}}})
      res.json({ status: 'success', value: evidences })
    } catch (error) {
      console.error(error)
      res.json({ status: 'error', msg: error })
    }
  } else {
    res.json({ status: 'error', msg: 'Evidence id list is required !' })
  }
})

module.exports = router
