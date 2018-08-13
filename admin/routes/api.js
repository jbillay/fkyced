const express = require('express')
const router = express.Router()
const models = require('../models')
const camunda = require('../lib/camunda')
const _ = require('lodash')

router.get('/currentProcess', async function (req, res, next) {
  const activeProcess = await models.processes.findOne({ where: { active: true } })
  const currentProcess = await camunda.searchProcess(activeProcess.processKey, activeProcess.processVersion)
  res.json({ key: currentProcess[0].key, version: currentProcess[0].version })
})

router.get('/form', async function (req, res, next) {
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

module.exports = router
