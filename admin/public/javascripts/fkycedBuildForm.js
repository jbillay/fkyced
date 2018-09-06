// fkycedBuildForm Javascript
/*
TODO: Display library
*/
class fkycedBuildForm {
  constructor(element, options, datas, form) {
    this.element = element
    this.options = Object.assign({panels: { center: 9, left: 3 } }, options)
    this.datas = datas
    this.form = form
    this.createDisplay(this.element, this.options, this.datas)
    if (form) {
      this.loadExistingForm(this.form, this.datas)
    }
  }

  createDisplay (element, options, datas) {
    element.addClass('container-fluid')
    element.append(`<div class="row"><div id="fkycedFormBuilderCenterPanel" class="col-${options.panels.center}"></div>
    <div id="fkycedFormBuilderLeftPanel" class="col-${options.panels.left}"></div></div>`)
    $('div#fkycedFormBuilderCenterPanel').sortable()
    $('div#fkycedFormBuilderCenterPanel').droppable({
      accept: '#fkycedSelectableItems li',
      drop: function( event, ui ) {
        const itemId = parseInt(ui.draggable.attr('id'))
        let itemType = null
        let attributes = {}
        if (itemId === -1) {
          const itemType = ui.draggable.attr('name')
          const functionName = 'add' + itemType.replace(/^\w/, c => c.toUpperCase())
          const { newElement, panelId } = $(BuildItemBuilder[functionName](attributes))[0]
          $('div#fkycedFormBuilderCenterPanel').append(newElement)
          const closeIconSelector = `div#${panelId} i.fa-window-close`
          const editIconSelector = `div#${panelId} i.fa-edit`
          const optionPanelSelector = `div#option_${panelId}`
          const buttonNameSelector = `input#buttonName${panelId}`
          const selectTypeSelector = `select#buttonType${panelId}`
          const selectColorSelector = `select#buttonColor${panelId}`
          const selectShapeSelector = `select#buttonShape${panelId}`
          $(optionPanelSelector).hide()
          $(closeIconSelector).click(function (event) {
            BuildItemBuilder.removePanel($(this).parent().parent().attr('id'))  })
          $(editIconSelector).click(function (event) {
            BuildItemBuilder.toggleOptions($(this).parent().parent().attr('id'))  })
          $(buttonNameSelector).change(function (event) {
            BuildItemBuilder.updateButtonName(panelId, $(this).val()) })
          $(selectTypeSelector).change(function (event) {
            BuildItemBuilder.updateButtonType(panelId, $(this).val()) })
          $(selectColorSelector).change(function (event) {
            BuildItemBuilder.updateButtonColor(panelId, $(this).val()) })
          $(selectShapeSelector).change(function (event) {
            BuildItemBuilder.updateButtonShape(panelId, $(this).val()) })
          } else {
            if (datas.objects) {
              for (const [objectKey, objectInfo] of Object.entries(datas.objects)) {
                for (const [key, value] of Object.entries(objectInfo.fields)) {
                  if (parseInt(value.id) === itemId) {
                    attributes['id'] = value.id
                    attributes['name'] = value.name
                    attributes['label'] = value.label
                    attributes['alwaysRequired'] = value.required
                    attributes['listId'] = value.listId
                    itemType = value.fieldType
                  }
                }
              }
              if (itemType) {
                const functionName = 'add' + itemType.replace(/^\w/, c => c.toUpperCase())
                const { newElement, panelId } = $(BuildItemBuilder[functionName](attributes))[0]
                $('div#fkycedFormBuilderCenterPanel').append(newElement)
                if (attributes.alwaysRequired) {
                  BuildItemBuilder.toggleRequired(panelId)
                }
                const closeIconSelector = `div#${panelId} i.fa-window-close`
                const editIconSelector = `div#${panelId} i.fa-edit`
                const requiredCheckboxSelector = `#required_${panelId}`
                const readonlyCheckboxSelector = `#readonly_${panelId}`
                const optionPanelSelector = `div#option_${panelId}`
                $(optionPanelSelector).hide()
                $(closeIconSelector).click(function (event) {
                  BuildItemBuilder.removePanel($(this).parent().parent().attr('id'))  })
                $(editIconSelector).click(function (event) {
                  BuildItemBuilder.toggleOptions($(this).parent().parent().attr('id'))  })
                $(requiredCheckboxSelector).click(function (event) {
                  BuildItemBuilder.toggleRequired($(this).parent().parent().parent().attr('id')) })
                $(readonlyCheckboxSelector).click(function (event) {
                  BuildItemBuilder.toggleReadonly($(this).parent().parent().parent().attr('id'))  })
              }
            }
          }
        }
      })
    this.createItemsSection($('div#fkycedFormBuilderLeftPanel'), datas)
  }

  loadExistingForm (form, datas) {
    const formObject = JSON.parse(form)
    for (const [objectKey, objectInfo] of Object.entries(formObject)) {
      for (const [childrenKey, childrenInfo] of Object.entries(objectInfo.children)) {
        if (childrenInfo.tagName === 'button') {
          let attributes = {}
          if (childrenInfo.attributes) {
            for (const [attributesKey, attributesInfo] of Object.entries(childrenInfo.attributes)) {
              if (attributesInfo.key === 'type') {
                attributes.type = attributesInfo.value
              } else if (attributesInfo.key === 'class') {
                const classList = attributesInfo.value.split(' ')
                classList.forEach(function (className) {
                  const pattern = new RegExp('^btn-')
                  if (className.match(pattern)) {
                    attributes.class = className
                  }
                })
              }
            }
          }
          if (childrenInfo.children) {
            for (const [subchildrenKey, subchildrenInfo] of Object.entries(childrenInfo.children)) {
              if (subchildrenInfo.type === 'text') {
                attributes.text = subchildrenInfo.content
              }
            }
          }
          const { newElement, panelId } = $(BuildItemBuilder.addCompleteButton(attributes))[0]
          $('div#fkycedFormBuilderCenterPanel').append(newElement)
          const closeIconSelector = `div#${panelId} i.fa-window-close`
          const editIconSelector = `div#${panelId} i.fa-edit`
          const optionPanelSelector = `div#option_${panelId}`
          const buttonNameSelector = `input#buttonName${panelId}`
          const selectTypeSelector = `select#buttonType${panelId}`
          const selectColorSelector = `select#buttonColor${panelId}`
          const selectShapeSelector = `select#buttonShape${panelId}`
          $(optionPanelSelector).hide()
          $(closeIconSelector).click(function (event) {
            BuildItemBuilder.removePanel($(this).parent().parent().attr('id'))  })
          $(editIconSelector).click(function (event) {
            BuildItemBuilder.toggleOptions($(this).parent().parent().attr('id'))  })
          $(buttonNameSelector).change(function (event) {
            BuildItemBuilder.updateButtonName(panelId, $(this).val()) })
          $(selectTypeSelector).change(function (event) {
            BuildItemBuilder.updateButtonType(panelId, $(this).val()) })
          $(selectColorSelector).change(function (event) {
            BuildItemBuilder.updateButtonColor(panelId, $(this).val()) })
          $(selectShapeSelector).change(function (event) {
            BuildItemBuilder.updateButtonShape(panelId, $(this).val()) })
        } else {
          if (childrenInfo.attributes) {
            for (const [attributesKey, attributesInfo] of Object.entries(childrenInfo.attributes)) {
              if (attributesInfo.key === 'id') {
                const itemId = parseInt(attributesInfo.value)
                let attributes = {}
                let itemType = null
                if (datas.objects) {
                  for (const [objectKey, objectInfo] of Object.entries(datas.objects)) {
                    for (const [key, value] of Object.entries(objectInfo.fields)) {
                      if (parseInt(value.id) === itemId) {
                        attributes['id'] = value.id
                        attributes['name'] = value.name
                        attributes['label'] = value.label
                        attributes['alwaysRequired'] = value.required
                        attributes['listId'] = value.listId
                        itemType = value.fieldType
                      }
                    }
                  }
                  if (itemType) {
                    const functionName = 'add' + itemType.replace(/^\w/, c => c.toUpperCase())
                    const { newElement, panelId } = $(BuildItemBuilder[functionName](attributes))[0]
                    $('div#fkycedFormBuilderCenterPanel').append(newElement)
                    if (attributes.alwaysRequired) {
                      BuildItemBuilder.toggleRequired(panelId)
                    }
                    const closeIconSelector = `div#${panelId} i.fa-window-close`
                    const editIconSelector = `div#${panelId} i.fa-edit`
                    const requiredCheckboxSelector = `#required_${panelId}`
                    const readonlyCheckboxSelector = `#readonly_${panelId}`
                    const optionPanelSelector = `div#option_${panelId}`
                    $(optionPanelSelector).hide()
                    $(closeIconSelector).click(function (event) {
                      BuildItemBuilder.removePanel($(this).parent().parent().attr('id'))  })
                    $(editIconSelector).click(function (event) {
                      BuildItemBuilder.toggleOptions($(this).parent().parent().attr('id'))  })
                    $(requiredCheckboxSelector).click(function (event) {
                      BuildItemBuilder.toggleRequired($(this).parent().parent().parent().attr('id')) })
                    $(readonlyCheckboxSelector).click(function (event) {
                      BuildItemBuilder.toggleReadonly($(this).parent().parent().parent().attr('id'))  })
                  }
                }
              }
            }
          }
        }
      }
    }

  }

  createItemsSection (element, datas) {
    const sections = [
      {
        label: 'Fields',
        name: 'fields',
        visible: true },
        {
          label: 'Components',
          name: 'components',
          visible: false } ]
    const obj = this
    const itemsSection = `<div id="ItemsSection"><div id="itemTypeSelector"></div></div>
    <div id="actionSection"><input type="button" id="previewButton" value="Preview"></div>`
    element.append(itemsSection)
    $('input#previewButton').click(function () { BuildItemBuilder.displayPreview() })
    $('div#itemTypeSelector').append(this.createSectionSelector(sections))
    sections.forEach(function (section) {
      const functionName = 'create' + section.name.replace(/^\w/, c => c.toUpperCase()) + 'List'
      obj[functionName]($('div#ItemsSection'), datas, section.visible)
    })
    $('a.previousSection').click(function () {
      let sectionTable = []
      $('div.sectionHeader').each(function (index) {
        sectionTable[index] = !$(this).hasClass('SectionNotDisplayed')
      })
      let currentIndex = null
      let newIndex = null
      let maxIndex = 0
      sectionTable.forEach(function (value, index) {
        if (value) {
          currentIndex = index
        }
        maxIndex = index
      })
      if (currentIndex === 0) {
        newIndex = maxIndex
      } else {
        newIndex = currentIndex - 1
      }
      $('div.sectionHeader').each(function (index) {
        if (index === currentIndex) {
          $(this).addClass('SectionNotDisplayed')
          const currentListPanelSelector = $(this).attr('id').substring(8).replace(/^\w/, c => c.toUpperCase()) + 'List'
          $('div#' + currentListPanelSelector).addClass('SectionNotDisplayed')
        } else if (index == newIndex) {
          $(this).removeClass('SectionNotDisplayed')
          const currentListPanelSelector = $(this).attr('id').substring(8).replace(/^\w/, c => c.toUpperCase()) + 'List'
          $('div#' + currentListPanelSelector).removeClass('SectionNotDisplayed')
        }
      })
    })
    $('a.nextSection').click(function () {
      let sectionTable = []
      $('div.sectionHeader').each(function (index) {
        sectionTable[index] = !$(this).hasClass('SectionNotDisplayed')
      })
      let currentIndex = null
      let newIndex = null
      let maxIndex = 0
      sectionTable.forEach(function (value, index) {
        if (value) {
          currentIndex = index
        }
        maxIndex = index
      })
      if (currentIndex === maxIndex) {
        newIndex = 0
      } else {
        newIndex = currentIndex + 1
      }
      $('div.sectionHeader').each(function (index) {
        if (index === currentIndex) {
          $(this).addClass('SectionNotDisplayed')
          const currentListPanelSelector = $(this).attr('id').substring(8).replace(/^\w/, c => c.toUpperCase()) + 'List'
          $('div#' + currentListPanelSelector).addClass('SectionNotDisplayed')
        } else if (index == newIndex) {
          $(this).removeClass('SectionNotDisplayed')
          const currentListPanelSelector = $(this).attr('id').substring(8).replace(/^\w/, c => c.toUpperCase()) + 'List'
          $('div#' + currentListPanelSelector).removeClass('SectionNotDisplayed')
        }
      })
    })
  }

  createSectionSelector (sections) {
    let html = ''
    sections.forEach(function (section) {
      html += '<div class="sectionHeader'
      html += section.visible ? '' : ' SectionNotDisplayed'
      html += `" id="section_${section.name}"><span>${section.label}</span></div>`
    })
    html += `<a class="previousSection">&#10094;</a>
    <a class="nextSection">&#10095;</a>`
    return html
  }

  createComponentsList (element, datas, visible) {
    const completeButton = '<li class="ui-widget-content" name="CompleteButton" id="-1"><i class="fas fa-clipboard-list"></i> Complete Button</li>'
    let html = '<div id="ComponentsList"'
    html += visible ? '' : ' class="SectionNotDisplayed"'
    html += '><ol id="fkycedSelectableItems">' + completeButton + '</ol></div>'
    element.append(html)
    $('#fkycedSelectableItems li').draggable({ revert: true })
  }

  createFieldsList (element, datas, visible) {
    let htmlList = `<div id="FieldsList">
    <input type="text" class="form-control" id="ListFieldsFilter" name="ListFieldsFilter" placeholder="Enter field name">
    <ol id="fkycedSelectableItems">`
    if (datas.objects) {
      for (const [objectKey, objectInfo] of Object.entries(datas.objects)) {
        for (const [key, value] of Object.entries(objectInfo.fields)) {
          htmlList += `<li class="ui-widget-content" name="${value.name}" id="${value.id}">${objectInfo.name}.${value.label}</li>`
        }
      }
    }
    htmlList += '</ol></div>'
    element.append(htmlList)
    $('#fkycedSelectableItems li').draggable({ revert: true })
    $('#ListFieldsFilter').bind('input', function (event) {
      const filter = $(this).val()
      $('#fkycedSelectableItems li').each(function(index) {
        const pattern = new RegExp(filter, "ig")
        if (!$(this).text().match(pattern)) {
          $(this).hide()
        } else {
          $(this).show()
        }
      });
    })
  }

  getJson () {
    return BuildItemBuilder.getJson()
  }
}

class BuildItem {
  static addPicklist (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <select class="form-control" id="${attributes.id}" name="${attributes.name}" listId="${attributes.listId}">
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
    </select>
    </div>`
    return item
  }

  static addPicklistMulti (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <select class="form-control" multiple id="${attributes.id}" name="${attributes.name}" listId="${attributes.listId}">
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
    </select>
    </div>`
    return item
  }

  static addCheckbox (attributes) {
    const item = `<div class="form-group form-check form-item">
    <input type="checkbox" class="form-check-input" id="${attributes.id}" name="${attributes.name}">
    <label class="form-check-label control-label" for="${attributes.name}">${attributes.label}</label>
    </div>`
    return item
  }

  static addText (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <input type="text" class="form-control" id="${attributes.id}" name="${attributes.name}" placeholder="Enter value">
    </div>`
    return item
  }

  static addPhone (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <input type="phone" class="form-control" id="${attributes.id}" name="${attributes.name}" placeholder="Enter phone number">
    </div>`
    return item
  }

  static addNumber (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <input type="number" class="form-control" id="${attributes.id}" name="${attributes.name}" placeholder="Enter value">
    </div>`
    return item
  }

  static addCurrency (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <input type="number" class="form-control" id="${attributes.id}" name="${attributes.name}" placeholder="Enter amount">
    </div>`
    return item
  }

  static addDate (attributes) {
    const item = `<div class="form-group form-item">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <input type="date" class="form-control" id="${attributes.id}" name="${attributes.name}" placeholder="Enter value">
    </div>`
    return item
  }

  static addCompleteButton (attributes) {
    const buttonType = attributes.type || 'submit'
    const buttonClass = attributes.class || 'btn-primary'
    const buttonText = attributes.text || 'Complete'
    const item = `<div class="form-group form-item">
    <button type="${buttonType}" class="btn ${buttonClass} form-item">${buttonText}</button>
    </div>`
    return item
  }
}


class BuildItemBuilder extends BuildItem {
  static extractHtmlForm () {
    let displayForm = ''
    $("div.form-item").each(function() {
      displayForm += '<div class="' + $(this).attr('class') + '">' + $(this).html() + '</div>'
    })
    return displayForm
  }

  static getJson () {
    const displayForm = this.extractHtmlForm()
    const jsonForm = window.himalaya.parse(displayForm)
    const stringForm = JSON.stringify(jsonForm)
    const cleanForm = stringForm.replace(/\\t+/g, '').replace(/\\n+/g, '')
    return cleanForm
  }

  static displayPreview () {
    const displayForm = this.extractHtmlForm()
    const htmlForm = '<!doctype html><html class="no-js" lang=""><head><link rel="stylesheet" href="css/bootstrap.min.css"></head><body><form>' + displayForm + '</form></body>'
    const popup = window.open("about:blank", "myPopup")
    popup.document.write(htmlForm)
  }

  static removePanel (id) {
    const panelSelector = `div#${id}`
    $(panelSelector).remove()
  }

  static toggleOptions (id ) {
    const optionPanelSelector = `div#option_${id}`
    if ($(optionPanelSelector).is(':visible')) {
      $(optionPanelSelector).hide('blind')
    } else {
      $(optionPanelSelector).show('blind')
    }
  }

  static updateButtonName (id, text) {
    const buttonSelector = `#${id} div.form-item button`
    $(buttonSelector).text(text)
  }

  static updateButtonType (id, newType) {
    const buttonSelector = `#${id} div.form-item button`
    $(buttonSelector).prop('type', newType)
  }

  static updateButtonColor (id, newColor) {
    const buttonSelector = `#${id} div.form-item button`
    const classList = $(buttonSelector).attr('class').split(' ')
    classList.forEach(function (className) {
      const pattern = new RegExp('^btn-')
      if (className.match(pattern)) {
        const newClass = className.substring(0, className.lastIndexOf('-') + 1) + newColor
        $(buttonSelector).removeClass(className)
        $(buttonSelector).addClass(newClass)
      }
    })
  }

  static updateButtonShape (id, newShape) {
    const buttonSelector = `#${id} div.form-item button`
    const classList = $(buttonSelector).attr('class').split(' ')
    classList.forEach(function (className) {
      const pattern = new RegExp('^btn-')
      if (className.match(pattern)) {
        const outlinePattern = new RegExp('outline-')
        if (newShape === 'outline') {
          if (!className.match(outlinePattern)) {
            const newClass = className.substring(0, className.lastIndexOf('-') + 1) +
            'outline-' + className.substring(className.lastIndexOf('-') + 1)
            $(buttonSelector).removeClass(className)
            $(buttonSelector).addClass(newClass)
          }
        } else if (newShape === 'plain') {
          if (className.match(outlinePattern)) {
            const newClass = className.substring(0, className.indexOf('-') + 1) + className.substring(className.lastIndexOf('-') + 1)
            $(buttonSelector).removeClass(className)
            $(buttonSelector).addClass(newClass)
          }
        }
      }
    })
  }

  static toggleRequired (id) {
    const panelSelector = `div#${id}`
    const labelItem = $(panelSelector).children('.form-group')
    const inputItem = labelItem.children('input')
    const selectItem = labelItem.children('select')
    if (labelItem.hasClass('required')) {
      labelItem.removeClass('required')
      inputItem.removeProp('required')
      selectItem.removeProp('required')
    } else {
      labelItem.addClass('required')
      inputItem.prop('required', true)
      selectItem.prop('required', true)
    }
  }

  static toggleReadonly (id) {
    const panelSelector = `div#${id}`
    const labelItem = $(panelSelector).children('.form-group')
    const inputItem = labelItem.children('input')
    const selectItem = labelItem.children('select')
    if (inputItem.prop('disabled') || selectItem.prop('disabled')) {
      inputItem.prop('disabled', false)
      selectItem.prop('disabled', false)
    } else {
      inputItem.prop('disabled', true)
      selectItem.prop('disabled', true)
    }
  }

  static addFieldConfigPanel (element, alwaysRequired) {
    const panelId = 'panel_' + Math.random().toString(36).substr(2, 17)
    const readOnlyCheckedbox = `<div class="form-group form-check">
      <input type="checkbox" class="form-check-input" id="readonly_${panelId}">
      <label class="form-check-label" for="readonly_${panelId}">Read Only</label></div>`
    let newElement = `<div class="configPanel" id="${panelId}">
    <div class="itemIcons float-right"><i class="far fa-edit"></i><i class="far fa-window-close"></i></div>
    ${element}
    <div class="optionPanel" id="option_${panelId}">
    <div class="form-group form-check">`
    if (alwaysRequired) {
      const readOnlyChecked = 'disabled checked="checked"'
      newElement += `<input type="checkbox" class="form-check-input" id="required_${panelId}" ${readOnlyChecked}>`
    } else {
      newElement += `<input type="checkbox" class="form-check-input" id="required_${panelId}">`
    }
    newElement += `<label class="form-check-label" for="required_${panelId}">Required</label></div>`
    newElement += readOnlyCheckedbox
    newElement += `</div></div>`
    return { newElement: newElement, panelId: panelId }
  }

  static addButtonConfigPanel (element, attributes) {
    const panelId = 'panel_' + Math.random().toString(36).substr(2, 17)
    const buttonText = attributes.text || 'complete'
    const selectColor = `<div class="form-group ">
    <label class="control-label" for="buttonColor${panelId}">Button Type</label>
    <select class="form-control" id="buttonColor${panelId}" name="buttonColor${panelId}">
    <option value="primary" selected>Primary</option>
    <option value="secondary">Secondary</option>
    <option value="success">Success</option>
    <option value="danger">Danger</option>
    <option value="warning">Warning</option>
    <option value="info">Info</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="link">Link</option>
    </select>
    </div>`
    const selectShape = `<div class="form-group ">
    <label class="control-label" for="buttonShape${panelId}">Button Shape</label>
    <select class="form-control" id="buttonShape${panelId}" name="buttonShape${panelId}">
    <option value="plain" selected>Plain</option>
    <option value="outline">Outlined</option>
    </select>
    </div>`
    const selectType = `<div class="form-group ">
    <label class="control-label" for="buttonType${panelId}">Button Type</label>
    <select class="form-control" id="buttonType${panelId}" name="buttonType${panelId}">
    <option value="submit" selected>Submit</option>
    <option value="reset">Reset</option>
    <option value="button">Button</option>
    </select>
    </div>`
    const buttonValue = `<div class="form-group">
    <label class="control-label" for="buttonName${panelId}">Button Name</label>
    <input type="text" class="form-control" id="buttonName${panelId}" name="buttonName${panelId}" value="${buttonText}">
    </div>`
    let newElement = `<div class="configPanel" id="${panelId}">
    <div class="itemIcons float-right"><i class="far fa-edit"></i><i class="far fa-window-close"></i></div>
    ${element}
    <div class="optionPanel" id="option_${panelId}">
    <div class="form-group form-check">`
    newElement += buttonValue
    newElement += selectType
    newElement += selectShape
    newElement += selectColor
    newElement += `</div></div></div>`
    return { newElement: newElement, panelId: panelId }
  }

  static addCompleteButton (attributes) {
    let newItem = super.addCompleteButton(attributes)
    return this.addButtonConfigPanel(newItem, attributes)
  }
  static addPicklistMulti (attributes) {
    let newItem = super.addPicklistMulti(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addPicklist (attributes) {
    let newItem = super.addPicklist(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addCheckbox (attributes) {
    let newItem = super.addCheckbox(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addText (attributes) {
    let newItem = super.addText(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addPhone (attributes) {
    let newItem = super.addPhone(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addNumber (attributes) {
    let newItem = super.addNumber(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addCurrency (attributes) {
    let newItem = super.addCurrency(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addDate (attributes) {
    let newItem = super.addDate(attributes)
    return this.addFieldConfigPanel(newItem, attributes.alwaysRequired)
  }
}

class fkycedDisplayForm {
  constructor(element, form, options, datas) {
    this.element = element
    this.form = form
    this.options = Object.assign({id: 'formDisplay', action: '', method: 'POST' , class: ''}, options)
    this.datas = datas
    this.refId = this.options.task
  }

  checkForListOptions (object) {
    const me = this
    let listId = null
    for (const [objectKey, objectInfo] of Object.entries(object)) {
      if (objectKey === 'tagName' && objectInfo === 'select') {
        object.attributes.forEach(function (attribute) {
          if (attribute.key === 'listid') {
            listId = attribute.value
          }
        })
        $.ajax({
          url: 'http://localhost:9615/api/list/values/' + listId,
          async: false,
        })
          .done(function (response) {
            const values = response.values
            let childrens = []
            for (const [key, value] of Object.entries(values)) {
              childrens.push({
                    'type': 'element', 'tagName': 'option',
                    'attributes': [ { 'key': 'value', 'value': key} ],
                    'children': [ { 'type': 'text', 'content': value} ] })
            }
            object.children = childrens
          })
          .fail(function (error) {
            console.error(error)
          })
      } else {
        if (objectInfo.children) {
          objectInfo.children.forEach(function (item) {
            me.checkForListOptions(item)
          })
        }
      }
    }
  }

  display () {
    // Transform form data to object
    let formObject = JSON.parse(this.form)
    // Parse form object to replace list values
    this.checkForListOptions(formObject)
    // Transform form object into HTML
    const htmlForm = window.himalaya.stringify(formObject)
    // Wrap up HTML form with form tags and include Task ID
    const html = `<form id="${this.options.id}" action="${this.options.action}"
                    method="${this.options.method}" class="${this.options.class}">
                    <input type="hidden" id="refId" name="refId" value="${this.refId}">
                    ${htmlForm}</form>`
    // Map the html form to the screen
    this.element.append(html)
    // insert existing value
    if (this.datas) {
      for (const [dataKey, dataValue] of Object.entries(this.datas)) {
        if ($('#' + dataValue.name).is("input") && $('#' + dataValue.name).attr('type') === 'text') {
          $('#' + dataValue.name).val(dataValue.value)
        } else if ($('#' + dataValue.name).is("select")) {
          $('#' + dataValue.name).val(dataValue.value)
        } else {
          $('#' + dataValue.name).val(dataValue.value)
        }
      }
    }
  }
}
