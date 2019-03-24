const { createIntType } = require('../../..')

module.exports = createIntType({
  name: 'IntBiDirectionalWithResolver',
  resolve: (value) => value * 2
})
