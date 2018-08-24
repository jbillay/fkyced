// fkycedBuildForm Javascript
/*
TODO: JSON export function
TODO: Display library
*/
class fkycedBuildForm {
  constructor(element, options, datas) {
    this.element = element
    this.options = Object.assign({panels: { center: 9, left: 3 } }, options)
    this.datas = datas
    this.createDisplay(this.element, this.options, this.datas)
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
        if (datas.objects) {
          for (const [objectKey, objectInfo] of Object.entries(datas.objects)) {
            for (const [key, value] of Object.entries(objectInfo.fields)) {
              if (parseInt(value.id) === itemId) {
                attributes['id'] = value.id
                attributes['name'] = value.name
                attributes['label'] = value.label
                attributes['alwaysRequired'] = value.required
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
            const optionPanelSelector = `div#option_${panelId}`
            $(optionPanelSelector).hide()
            $(closeIconSelector).click(function (event) { BuildItemBuilder.removePanel($(this).parent().parent().attr('id'))  })
            $(editIconSelector).click(function (event) { BuildItemBuilder.toggleOptions($(this).parent().parent().attr('id'))  })
            $(requiredCheckboxSelector).click(function (event) { BuildItemBuilder.toggleRequired($(this).parent().parent().parent().attr('id'))  })
          }
        }
      }
    })
    this.createItemsSection($('div#fkycedFormBuilderLeftPanel'), datas)
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
        visible: false }
    ]
    const obj = this
    const itemsSection = `<div id="ItemsSection"><div id="itemTypeSelector"></div></div><div id="actionSection"></div>`
    element.append(itemsSection)
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
    let html = '<div id="ComponentsList"'
    html += visible ? '' : ' class="SectionNotDisplayed"'
    html += '><ol id="fkycedSelectableItems"></ol></div>'
    element.append(html)
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

  exportJson () {

  }
}

class BuildItem {
  static addPicklist (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <select class="form-control" id="${attributes.name}" name="${attributes.name}">
      <option>1</option>
      <option>2</option>
      <option>3</option>
    </select>
    </div>`
    return item
  }

  static addCheckbox (attributes) {
    const item = `<div class="form-group form-check">
    <input type="checkbox" class="form-check-input" id="${attributes.name}" name="${attributes.name}">
    <label class="form-check-label control-label" for="${attributes.name}">${attributes.label}</label>
    </div>`
    return item
  }

  static addText (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.label}">${attributes.label}</label>
    <input type="text" class="form-control" id="${attributes.label}" name="${attributes.label}" placeholder="Enter value">
    </div>`
    return item
  }

  static addPhone (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.label}">${attributes.label}</label>
    <input type="phone" class="form-control" id="${attributes.label}" name="${attributes.label}" placeholder="Enter phone number">
    </div>`
    return item
  }

  static addNumber (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.label}">${attributes.label}</label>
    <input type="number" class="form-control" id="${attributes.label}" name="${attributes.label}" placeholder="Enter value">
    </div>`
    return item
  }

  static addCurrency (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.label}">${attributes.label}</label>
    <input type="number" class="form-control" id="${attributes.label}" name="${attributes.label}" placeholder="Enter amount">
    </div>`
    return item
  }

  static addDate (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.label}">${attributes.label}</label>
    <input type="date" class="form-control" id="${attributes.label}" name="${attributes.label}" placeholder="Enter value">
    </div>`
    return item
  }
}


class BuildItemBuilder extends BuildItem {
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

  static toggleRequired (id) {
    const panelSelector = `div#${id}`
    const labelItem = $(panelSelector).children('.form-group')
    if (labelItem.hasClass('required')) {
      labelItem.removeClass('required')
    } else {
      labelItem.addClass('required')
    }
  }

  static addConfigPanel (element, alwaysRequired) {
    const panelId = 'panel_' + Math.random().toString(36).substr(2, 17)
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
    newElement += `<label class="form-check-label" for="required_${panelId}">Required</label></div></div></div>`
    return { newElement: newElement, panelId: panelId }
  }

  static addPicklist (attributes) {
    let newItem = super.addPicklist(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addCheckbox (attributes) {
    let newItem = super.addCheckbox(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addText (attributes) {
    let newItem = super.addText(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addPhone (attributes) {
    let newItem = super.addPhone(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addNumber (attributes) {
    let newItem = super.addNumber(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addCurrency (attributes) {
    let newItem = super.addCurrency(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
  static addDate (attributes) {
    let newItem = super.addDate(attributes)
    return this.addConfigPanel(newItem, attributes.alwaysRequired)
  }
}

class BuildItemDisplay extends BuildItem {
}
