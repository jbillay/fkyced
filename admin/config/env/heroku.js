module.exports = {
  secret: 'S€cr€tFKYC€d@c',
  engineApi: 'http://fkyced-engine:8080/engine-rest',
  fkycedDB: 'mysql://fkyced:fkyced@fkyced-db:3306/fkyced_db',
  engineDB: 'mysql://fkyced:fkyced@fkyced-db:3306/camunda_db',
  redis:
    'redis://h:p33860a8142b4d868c002a2fc0a5587569e10581ba46f6eb2ada7efdc6ac7b64c@ec2-52-212-239-249.eu-west-1.compute.amazonaws.com:26709',
  EMIT_STACK_TRACE: false,
  logLevel: 'info'
}
