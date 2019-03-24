const { createStringType } = require('../../..')

module.exports = createStringType({
  name: 'StringBiDirectionalWithResolver',
  resolve: (value) => `typeResolver: (${value})`
})
