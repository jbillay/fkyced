// fkycedBuildForm Javascript
/*
TODO: Slider between fields / components
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
        const itemName = ui.draggable.attr("name")
        let itemType = null
        let attributes = {}
        if (datas.objects) {
          for (const [objectKey, objectInfo] of Object.entries(datas.objects)) {
            for (const [key, value] of Object.entries(objectInfo.fields)) {
              if (value.name === itemName) {
                attributes['name'] = value.name
                attributes['label'] = value.label
                itemType = value.fieldType
              }
            }
          }
        }
        if (itemType) {
          const functionName = 'add' + itemType.replace(/^\w/, c => c.toUpperCase())
          console.log(functionName)
          const { newElement, panelId } = $(BuildItemBuilder[functionName](attributes))[0]
          $('div#fkycedFormBuilderCenterPanel').append(newElement)
          const closeIconSelector = `div#${panelId} i.fa-window-close`
          const editIconSelector = `div#${panelId} i.fa-edit`
          const requriedCheckboxSelector = `#required_${panelId}`
          const optionPanelSelector = `div#option_${panelId}`
          $(optionPanelSelector).hide()
          $(closeIconSelector).click(function (event) { BuildItemBuilder.removePanel($(this).parent().parent().attr('id'))  })
          $(editIconSelector).click(function (event) { BuildItemBuilder.toggleOptions($(this).parent().parent().attr('id'))  })
          $(requriedCheckboxSelector).click(function (event) { BuildItemBuilder.toggleRequired($(this).parent().parent().parent().attr('id'))  })
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
    const itemsSection = `<div id="ItemsSection"><div id="itemTypeSelector"></div></div><div id="actionSection"></div>`
    element.append(itemsSection)
    $('div#itemTypeSelector').append(this.createSectionSelector(sections))
    $('a.previousSection').click(function () {
      alert('previousSection')
    })
    $('a.nextSection').click(function () {
      let next = 0
      $('div.sectionHeader').each(function (index) {
          if (next === 1) {
            $(this).removeClass('SectionNotDisplayed')
            next = 0
          } else if (!$(this).hasClass('SectionNotDisplayed')) {
            console.log('ICI')
            $(this).addClass('SectionNotDisplayed')
            next = 1
          }
      })
    })
    this.createFieldsList($('div#ItemsSection'), datas, true)
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

  createComponentsList (element, visible) {
  }

  createFieldsList (element, datas, visible) {
    let htmlList = `<div id="itemsList">
      <input type="text" class="form-control" id="ListItemsFilter" name="ListItemsFilter" placeholder="Enter field name">
      <ol id="fkycedSelectableItems">`
    if (datas.objects) {
      for (const [objectKey, objectInfo] of Object.entries(datas.objects)) {
        for (const [key, value] of Object.entries(objectInfo.fields)) {
          htmlList += `<li class="ui-widget-content" name="${value.name}">${objectInfo.name}.${value.label}</li>`
        }
      }
    }
    htmlList += '</ol></div>'
    element.append(htmlList)
    $('#fkycedSelectableItems li').draggable({ revert: true })
    $('#ListItemsFilter').bind('input', function (event) {
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
}

class BuildItem {
  static addPicklist (attributes) {
    const item = `<div class="form-group">
    <label class="control-label" for="${attributes.name}">${attributes.label}</label>
    <select class="form-control" id="${attributes.name}" name="${attributes.name}">
    <option>1</option>
    <option>2</option>
    <option>3</option>
    <option>4</option>
    <option>5</option>
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

  static toggleRequired (id ) {
    const panelSelector = `div#${id}`
    const labelItem = $(panelSelector).children('.form-group')
    if (labelItem.hasClass('required')) {
      labelItem.removeClass('required')
    } else {
      labelItem.addClass('required')
    }
  }

  static addConfigPanel (element) {
    const panelId = 'panel_' + Math.random().toString(36).substr(2, 17)
    const newElement = `<div class="configPanel" id="${panelId}">
    <div class="itemIcons float-right"><i class="far fa-edit"></i><i class="far fa-window-close"></i></div>
    ${element}
    <div class="optionPanel" id="option_${panelId}">
    <div class="form-group form-check">
    <input type="checkbox" class="form-check-input" id="required_${panelId}">
    <label class="form-check-label" for="required_${panelId}">Required</label>
    </div>
    </div>
    </div>`
    return { newElement: newElement, panelId: panelId }
  }

  static addPicklist (attributes) {
    let newItem = super.addPicklist(attributes)
    return this.addConfigPanel(newItem)
  }
  static addCheckbox (attributes) {
    let newItem = super.addCheckbox(attributes)
    return this.addConfigPanel(newItem)
  }
  static addText (attributes) {
    let newItem = super.addText(attributes)
    return this.addConfigPanel(newItem)
  }
  static addPhone (attributes) {
    let newItem = super.addPhone(attributes)
    return this.addConfigPanel(newItem)
  }
  static addNumber (attributes) {
    let newItem = super.addNumber(attributes)
    return this.addConfigPanel(newItem)
  }
  static addCurrency (attributes) {
    let newItem = super.addCurrency(attributes)
    return this.addConfigPanel(newItem)
  }
  static addDate (attributes) {
    let newItem = super.addDate(attributes)
    return this.addConfigPanel(newItem)
  }
}

class BuildItemDisplay extends BuildItem {
}
