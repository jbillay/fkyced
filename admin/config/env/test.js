module.exports = {
  secret: 'S€cr€tFKYC€d',
  engineApi: 'http://fkyced-engine:8080/engine-rest',
  fkycedDB: 'mysql://fkyced:fkyced@fkyced-db:3306/fkyced_db',
  engineDB: 'mysql://fkyced:fkyced@fkyced-db:3306/camunda_db',
  redis: 'fkyced-session',
  EMIT_STACK_TRACE: true,
  logLevel: 'debug'
}
