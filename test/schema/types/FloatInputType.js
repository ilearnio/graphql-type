const { createFloatType } = require('../../..')

module.exports = createFloatType({
  name: 'FloatInputType',
  validate: {
    min: 10.55,
    max: 100.99,
    minDecimals: 2,
    maxDecimals: 5,
    test (value) {
      // It must always be string
      return typeof value === 'string' && value > 80
    }
  },
  validationMessages: {
    type: 'type error',
    min: 'min error',
    max: 'max error',
    minDecimals: 'minDecimals error',
    maxDecimals: 'maxDecimals error',
    test: 'test error'
  }
})
