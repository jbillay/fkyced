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
    const evidences = await models.fkycedEvidences.findAll()
    res.render('evidence', { user: userInfo, evidences: evidences })
  }
})

router.get('/edit/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const evidenceId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    const evidence = await models.fkycedEvidences.findOne({ where: { id : evidenceId }})
    res.render('editEvidence', { user: userInfo, evidence: evidence })
  }
})

router.get('/new', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const userInfo = await camunda.getUserInfo(user.authenticatedUser)
    res.render('newEvidence', { user: userInfo })
  }
})

router.post('/save', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const evidenceId = (typeof req.body.evidenceId === 'undefined') ? null : req.body.evidenceId
    const { evidenceName, evidenceRequired, evidenceDescription, evidenceValidDoc } = req.body
    const required = (typeof evidenceRequired === 'undefined') ? false : true
    if (evidenceId) {
      let evidence = await models.fkycedEvidences.findOne({ where: { id: evidenceId }})
      evidence.name = evidenceName
      evidence.required = required
      evidence.description = evidenceDescription
      evidence.validDocument = evidenceValidDoc
      try {
        await evidence.save()
      } catch (error) {
        console.error(error)
        const userInfo = await camunda.getUserInfo(user.authenticatedUser)
        res.render('editEvidence', { user: userInfo, evidence: evidence, error: error })
      }
    } else {
      try {
        const newEvidence = await models.fkycedEvidences.create(
          { name: evidenceName, required: required, description: evidenceDescription, validDocument: evidenceValidDoc })
      } catch (error) {
        console.error(error)
        const userInfo = await camunda.getUserInfo(user.authenticatedUser)
        res.render('newEvidence', { user: userInfo, error: error })
      }
    }
    res.redirect('/evidence')
  }
})

router.get('/delete/:id', async function(req, res, next) {
  const user = req.cookies.currentAdminUser
  const evidenceId = req.params.id
  if (typeof user === "undefined" || !user.authenticated) {
    res.redirect('/')
  } else {
    const evidence = await models.fkycedEvidences.findOne({ where: { id : evidenceId }})
    await evidence.destroy()
    res.redirect('/evidence')
  }
})

module.exports = router
