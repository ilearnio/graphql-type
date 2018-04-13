const { createStringInputType } = require('../../..')

module.exports = createStringInputType({
  name: 'StringInputType',
  validate: {
    min: 5,
    max: 15,
    regexp: /^\w+@\w+\.[a-z]{2,}$/i,
    test: (value) => !value.endsWith('@example.com')
  },
  validationMessages: {
    min: 'min error',
    max: 'max error',
    regexp: 'regexp error',
    test: 'test error'
  }
})
