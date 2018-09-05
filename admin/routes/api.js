const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')
const cors = require('cors')

router.get('/currentProcess', cors(), async function (req, res, next) {
  const activeProcess = await models.processes.findOne({ where: { active: true } })
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

module.exports = router
