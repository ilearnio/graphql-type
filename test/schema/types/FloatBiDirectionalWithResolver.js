const { createFloatType } = require('../../..')

module.exports = createFloatType({
  name: 'FloatBiDirectionalWithResolver',
  resolve: (value) => value * 2
})
