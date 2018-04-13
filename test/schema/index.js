const {
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType
} = require('graphql')
const StringInputType = require('./types/StringInputType')
const IntInputType = require('./types/IntInputType')
const FloatInputType = require('./types/FloatInputType')
const IntOutputType = require('./types/IntOutputType')
const IntBiDirectionalType = require('./types/IntBiDirectionalType')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      testStringInputType: {
        type: GraphQLString,
        args: { string: { type: StringInputType } },
        resolve: () => 'OK'
      },
      testIntInputType: {
        type: GraphQLString,
        args: { int: { type: IntInputType } },
        resolve: () => 'OK'
      },
      testFloatInputType: {
        type: GraphQLString,
        args: { int: { type: FloatInputType } },
        resolve: () => 'OK'
      },

      //
      // For testing input/output
      //

      testIntInputOnlyType: {
        type: IntInputType,
        args: { int: { type: IntInputType } },
        resolve: () => 'not int'
      },
      testIntOutputOnlyType: {
        type: IntOutputType,
        args: { int: { type: IntOutputType } },
        resolve: () => 100
      },
      testIntBiDirectionalType: {
        type: IntBiDirectionalType,
        args: { int: { type: IntBiDirectionalType } },
        resolve: (_, { int }) => 100 - int
      }
    }
  })
})
