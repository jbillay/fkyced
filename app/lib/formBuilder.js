const parseString = require('xml2js').parseString
const cheerio = require('cheerio')
const _ = require('lodash')


const getFormGroup = function () {
  return `<div class="form-group"></div>`
}

const getFormCheck = function () {
  return `<div class="form-group"><div class="form-check"></div></div>`
}

const getTextInput = function (id, label, placeholder, values) {
  const group = getFormGroup()
  const $ = cheerio.load(group)
  $('div')
    .append(`<label for="${id}">${label}</label>`)
    .append(`<input type="text" class="form-control" id="${id}" name="${id}" placeholder="${placeholder}">`)
  return $.html('div')
}

const getEmailInput = function (id, label, placeholder, values) {
  const group = getFormGroup()
  const $ = cheerio.load(group)
  $('div')
    .append(`<label for="${id}">${label}</label>`)
    .append(`<input type="email" class="form-control" id="${id}" name="${id}" placeholder="${placeholder}">`)
  return $.html('div')
}

const getNumberInput = function (id, label, placeholder, values) {
  const group = getFormGroup()
  const $ = cheerio.load(group)
  $('div')
    .append(`<label for="${id}">${label}</label>`)
    .append(`<input type="number" class="form-control" id="${id}" name="${id}" placeholder="${placeholder}">`)
  return $.html('div')
}

const getBoleanInput = function (id, label, values) {
  const group = getFormCheck()
  const $ = cheerio.load(group)
  $('div.form-check')
    .append(`<input class="form-check-input" type="checkbox" name="${id}" id="${id}">`)
    .append(`<label class="form-check-label" for="${id}">${label}</label>`)
  return $.html('div.form-group')
}

const getDateInput = function (id, label, placeholder, values) {
  const group = getFormGroup()
  const $ = cheerio.load(group)
  $('div')
    .append(`<label for="${id}">${label}</label>`)
    .append(`<input type="date" class="form-control" id="${id}" name="${id}" placeholder="${placeholder}">`)
  return $.html('div')
}

const getSelectInput = function (id, label, values) {
  const selectOptions = _.map(values, function (value) {
    return `<option value="${value.id}">${value.name}</option>`
  })
  let options = '<option>Select a value</option>'
  for (option in selectOptions) {
    options += selectOptions[option]
  }
  const group = getFormGroup()
  const $ = cheerio.load(group)
  $('div')
    .append(`<label for="${id}">${label}</label>`)
    .append(`<select class="form-control" id="${id}" name="${id}">${options}</select>`)
  return $.html('div')
}

const getField = function (id, type, label, values) {
  let input = null
  switch(type) {
    case 'string':
        input = getTextInput(id, label, '', values)
        break;
    case 'long':
        input = getNumberInput(id, label, '', values)
        break;
    case 'boolean':
        input = getBoleanInput(id, label, values)
        break;
    case 'date':
        input = getDateInput(id, label, '', values)
        break;
    case 'enum':
        input = getSelectInput(id, label, values)
        break;
  }
  const field = input
  return field
}

const extractValues = function (valueList) {
  const values = _.map(valueList, '$')
  return values
}

const buildForm = function (fields, refId, callback) {
  let $ = cheerio.load(`<form method="POST" action="${callback}"></form>`)
  for (const field in fields) {
    if (fields[field]['$']) {
      const id = fields[field]['$']['id'] || ''
      const label = fields[field]['$']['label'] || ''
      const type = fields[field]['$']['type'] || ''
      let values = null
      if (fields[field]['camunda:value']) {
        values = extractValues(fields[field]['camunda:value'])
      }
      $('form').append(getField(id, type, label, values))
    }
  }
  $('form').append(`<input type="hidden" id="refId" name="refId" value="${refId}">`)
  $('form').append(`<button type="submit" class="btn btn-primary">Complete</button>`)
  const form = $.html(`form`)
  return form
}

const getFormFields = function (formXML) {
  let formFields = null
  if (formXML[0] && formXML[0]['camunda:formData'] &&
      formXML[0]['camunda:formData'][0] &&
      formXML[0]['camunda:formData'][0]['camunda:formField']) {
        formFields = formXML[0]['camunda:formData'][0]['camunda:formField']
      }
  return formFields;
}

const createByTaskId = async function (xml, taskKey, taskId) {
  return new Promise(function(resolve, reject) {
      parseString(xml, function (err, result) {
        if (err) {
          reject(err)
        } else {
          const listOfTasks = result['bpmn:definitions']['bpmn:process'][0]
          let formInfo = null
          for (const taskType in listOfTasks) {
            for (const task in listOfTasks[taskType]) {
              if (listOfTasks[taskType][task] &&
                  listOfTasks[taskType][task]['$'] &&
                  listOfTasks[taskType][task]['$']['id'] &&
                  listOfTasks[taskType][task]['$']['id'] === taskKey)
                {
                  if (listOfTasks[taskType][task]['$']['camunda:formKey']) {
                    const extFormName = listOfTasks[taskType][task]['$']['camunda:formKey']
                    formInfo = { type: 'external', form: extFormName }
                  }
                  else {
                    const intForm = listOfTasks[taskType][task]['bpmn:extensionElements']
                    formInfo = { type: 'internal', form: intForm }
                  }
                }
              }
            }
          if (formInfo) {
            if (formInfo.type === 'internal') {
              const formFields = getFormFields(formInfo.form)
              const form = buildForm(formFields, taskId, '/completeTask')
              resolve({ type: formInfo.type, form: form })
            } else if (formInfo.type === 'external') {
              resolve({ type: formInfo.type, form: formInfo.form })
            }
          } else {
            resolve(null)
          }
        }
      })
    }
  );
}

const createByTaskType = async function (xml, taskType, id, callback) {
  return new Promise(function(resolve, reject) {
      parseString(xml, function (err, result) {
        if (err) {
          reject(err)
        } else {
          const formInfo = result['bpmn:definitions']['bpmn:process'][0][taskType][0]['bpmn:extensionElements']
          const formFields = getFormFields(formInfo)
          const form = buildForm(formFields, id, callback)
          resolve(form)
        }
      })
    }
  );
}

module.exports = { createByTaskId, createByTaskType }
