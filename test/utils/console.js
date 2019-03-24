/* eslint-env mocha */
const sinon = require('sinon')

exports.stubConsoleOnBeforeEach = (
  methods = ['info', 'warn', 'error', 'time']
) => {
  const ctx = {}
  beforeEach(() => {
    methods.forEach(f => {
      ctx[f] = sinon.stub(console, f).returns({})
    })
  })
  afterEach(() => {
    methods.forEach(f => {
      ctx[f].restore()
    })
  })
  return ctx
}
