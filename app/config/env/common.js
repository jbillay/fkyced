const path = require('path')

module.exports = {
  path: path.normalize(path.join(__dirname, '..')),
  port: process.env.PORT || 4242
}
