const { createIntType } = require('../../..')

module.exports = createIntType({
  name: 'IntBiDirectionalType',
  validate: {
    min: 10,
    max: 100,
    test (value) {
      // It must always be string
      return typeof value === 'string' && value > 50
    }
  },
  validationMessages: {
    min: 'min error',
    max: 'max error',
    test: 'test error'
  }
})
