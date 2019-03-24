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
const StringBiDirectionalWithResolver = require('./types/StringBiDirectionalWithResolver')
const IntBiDirectionalWithResolver = require('./types/IntBiDirectionalWithResolver')
const FloatBiDirectionalWithResolver = require('./types/FloatBiDirectionalWithResolver')

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
      },

      //
      // For testing type "resolve"
      //

      testStringBiDirectionalWithResolverType: {
        type: StringBiDirectionalWithResolver,
        args: { string: { type: StringBiDirectionalWithResolver } },
        resolve: (_, { string }) => `queryResolver: (${string})`
      },
      testIntBiDirectionalWithResolverType: {
        type: IntBiDirectionalWithResolver,
        args: { int: { type: IntBiDirectionalWithResolver } },
        resolve: (_, { int }) => int * 10
      },
      testFloatBiDirectionalWithResolverType: {
        type: FloatBiDirectionalWithResolver,
        args: { float: { type: FloatBiDirectionalWithResolver } },
        resolve: (_, { float }) => float * 10
      }
    }
  })
})
