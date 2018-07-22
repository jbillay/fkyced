const fs          = require('fs')
const path        = require('path')
const Sequelize   = require('sequelize')
const config      = require('../config')
const sequelize   = new Sequelize(config.fkycedDB)
const db          = {};

sequelize
  .authenticate()
  .then(function(err) {
    if (!!err) {
      console.error('Unable to connect to the database: Exiting.' + err)
      process.exit(0)
    } else {
      console.log('Connection has been established successfully.')

      fs
        .readdirSync(__dirname)
        .filter(function(file) {
          return (file.indexOf('.') !== 0) && (file !== 'index.js')
        })
        .forEach(function(file) {
          var model = sequelize['import'](path.join(__dirname, file))
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

      console.log('Database loaded !')
    }
  });

module.exports = db
