const common = require('./env/common')

const env = process.env.NODE_ENV || 'development'

// console.log('info', `Load environment ${env} configuration`)

const config = require(`./env/${env}`)

module.exports = Object.assign({}, common, config)
