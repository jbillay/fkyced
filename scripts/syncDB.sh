#!/Users/jeremy/.nvm/versions/node/v8.9.3/bin/node

const fs = require('fs')
const path = require('path')
const Sequelize   = require('../admin/node_modules/sequelize')
const sequelize   = new Sequelize('mysql://fkyced:fkyced@127.0.0.1:3306/fkyced_db')
const modelsPath = '../admin/models/'
let db = {}

sequelize.authenticate()
  .then(function (err){
    if (err) {
      console.error(err)
      process.exit(0)
    } else {
      fs
        .readdirSync(modelsPath)
        .filter(function(file) {
          return (file.indexOf('.') !== 0) && (file !== 'index.js')
        })
        .forEach(function(file) {
          var model = sequelize['import'](path.join(modelsPath, file))
          console.log(model.name + ' model loaded');
          db[model.name] = model
        })

      Object.keys(db).forEach(function(modelName) {
        if ('associate' in db[modelName]) {
           console.log(modelName + ' model association done')
           db[modelName].associate(db)
        }
      })

      db.sequelize = sequelize
      db.Sequelize = Sequelize

      db.sequelize.sync({force: true})
        .then(function () {
            console.log('Synchronisation Done')
        })
        .catch(function (err) {
            console.log('Error on sync db : ' + err);
        });
      }
    })
