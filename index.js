const typeOf = require('just-typeof')
const assert = require('assert')
const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')

// To which direction the assertion will be applied, on input or output
const DIRECTION_INPUT = 'input'
const DIRECTION_OUTPUT = 'output'
const DIRECTION_BOTH = 'both'

class GraphQLTypeError extends GraphQLError {
}

const isFloat = (n) => parseFloat(n) === n && /^\d+\.\d+$/.test(String(n))

const assertString = (value, attrs) => {
  const { name, validate, validationMessages } = attrs
  const { min, max, regexp, test } = validate || {}

  const defaultMessages = {
    type: `Expecting "${name}" to be a string but ${typeOf(value)} was passed.`,
    min: `Minimum length for "${name}" is ${min}.`,
    max: `Maximum length for "${name}" is ${max}.`,
    regexp: `"${name}" is invalid.`,
    test: `"${name}" is invalid.`
  }
  const messages = Object.assign(defaultMessages, validationMessages)

  if (typeof value !== 'string') {
    throw new GraphQLTypeError(messages.type)
  }
  if (min && value.length < min) {
    throw new GraphQLTypeError(messages.min)
  }
  if (max && value.length > max) {
    throw new GraphQLTypeError(messages.max)
  }
  if (regexp && !regexp.test(value)) {
    throw new GraphQLTypeError(messages.regexp)
  }
  if (test && !test(value)) {
    throw new GraphQLTypeError(messages.test)
  }
}

const assertInt = (value, attrs) => {
  const { name, validate, validationMessages } = attrs
  const { min, max, test } = validate || {}

  const defaultMessages = {
    type: `Expecting "${name}" to be an integer but ${typeOf(value)} was passed.`,
    min: `Minimum number for "${name}" is ${min}.`,
    max: `Maximum number for "${name}" is ${max}.`,
    test: `"${name}" is invalid.`
  }
  const messages = Object.assign(defaultMessages, validationMessages)

  value = String(value)

  if (!Number.isInteger(Number(value))) {
    throw new GraphQLTypeError(messages.type)
  }
  if (min && value < min) {
    throw new GraphQLTypeError(messages.min)
  }
  if (max && value > max) {
    throw new GraphQLTypeError(messages.max)
  }
  if (test && !test(value)) {
    throw new GraphQLTypeError(messages.test)
  }
}

const assertFloat = (value, attrs) => {
  const { name, validate, validationMessages } = attrs
  const { min, max, maxDecimals, test } = validate || {}

  const defaultMessages = {
    type: `Expecting "${name}" to be a float but ${typeOf(value)} was passed.`,
    min: `Minimum number for "${name}" is ${min}.`,
    max: `Maximum number for "${name}" is ${max}.`,
    maxDecimals: `The float number "${name}" should not exceed ${maxDecimals} decimals.`,
    test: `"${name}" is invalid.`
  }
  const messages = Object.assign(defaultMessages, validationMessages)

  if (!isFloat(Number(value))) {
    throw new GraphQLTypeError(messages.type)
  }

  value = String(value)
  const decimals = value.split('.')[1]

  if (min && value < min) {
    throw new GraphQLTypeError(messages.min)
  }
  if (max && value > max) {
    throw new GraphQLTypeError(messages.max)
  }
  if (maxDecimals && decimals.length > maxDecimals) {
    throw new GraphQLTypeError(messages.maxDecimals)
  }
  if (test && !test(value)) {
    throw new GraphQLTypeError(messages.test)
  }
}

const createScalarType = (attrs, handler, direction = DIRECTION_BOTH) => {
  return new GraphQLScalarType({
    name: attrs.name,
    description: attrs.description,
    // Gets invoked when serializing the result to send it back to the client.
    serialize (value) {
      if (direction === DIRECTION_OUTPUT || direction === DIRECTION_BOTH) {
        try {
          return handler(value, attrs)
        } catch (e) {
          console.error(e)
        }
      }
      // Always push forward the output, even on error
      return value
    },
    // Gets invoked to parse client input that was passed through variables.
    parseValue (value) {
      if (direction === DIRECTION_INPUT || direction === DIRECTION_BOTH) {
        return handler(value, attrs)
      }
      throw new GraphQLTypeError(`"${attrs.name}" type must be Output Type but got input.`)
    },
    // Gets invoked to parse client input that was passed inline in the query.
    parseLiteral (ast) {
      if (direction === DIRECTION_INPUT || direction === DIRECTION_BOTH) {
        return handler(ast.value, attrs, ast)
      }
      throw new GraphQLTypeError(`"${attrs.name}" type must be Output Type but got input.`)
    }
  })
}

/**
 * Asserts root attributes passed to the type creator function.
 */
const assertRootAttrs = (attrs) => {
  const allowedAttrs = ['name', 'description', 'validate', 'validationMessages', 'resolve']
  assert(!!attrs.name, 'Must provide name.')
  Object.keys(attrs).forEach(attr => {
    assert(allowedAttrs.includes(attr),
      `Unknown attribute "${attr}" set for "${attrs.name}" type.`)
  })
}

//
// String
//

const stringTypeHandler = (attrs) => {
  assertRootAttrs(attrs)
  return (value) => {
    assertString(value, attrs)
    if (typeof attrs.resolve === 'function') {
      return attrs.resolve(value)
    }
    return value
  }
}

const createStringType = (attrs) => {
  return createScalarType(attrs, stringTypeHandler(attrs), DIRECTION_BOTH)
}

const createStringInputType = (attrs) => {
  return createScalarType(attrs, stringTypeHandler(attrs), DIRECTION_INPUT)
}

const createStringOutputType = (attrs) => {
  return createScalarType(attrs, stringTypeHandler(attrs), DIRECTION_OUTPUT)
}

//
// Int
//

const intTypeHandler = (attrs) => {
  assertRootAttrs(attrs)
  return (value) => {
    assertInt(value, attrs)
    if (typeof attrs.resolve === 'function') {
      return attrs.resolve(value)
    }
    return Number(value)
  }
}

const createIntType = (attrs) => {
  return createScalarType(attrs, intTypeHandler(attrs), DIRECTION_BOTH)
}

const createIntInputType = (attrs) => {
  return createScalarType(attrs, intTypeHandler(attrs), DIRECTION_INPUT)
}

const createIntOutputType = (attrs) => {
  return createScalarType(attrs, intTypeHandler(attrs), DIRECTION_OUTPUT)
}

//
// Float
//

const floatTypeHandler = (attrs) => {
  assertRootAttrs(attrs)
  return (value) => {
    assertFloat(value, attrs)
    if (typeof attrs.resolve === 'function') {
      return attrs.resolve(value)
    }
    return Number(value)
  }
}

const createFloatType = (attrs) => {
  return createScalarType(attrs, floatTypeHandler(attrs), DIRECTION_BOTH)
}

const createFloatInputType = (attrs) => {
  return createScalarType(attrs, floatTypeHandler(attrs), DIRECTION_INPUT)
}

const createFloatOutputType = (attrs) => {
  return createScalarType(attrs, floatTypeHandler(attrs), DIRECTION_OUTPUT)
}

exports.DIRECTION_INPUT = DIRECTION_INPUT
exports.DIRECTION_OUTPUT = DIRECTION_OUTPUT
exports.DIRECTION_BOTH = DIRECTION_BOTH

exports.GraphQLTypeError = GraphQLTypeError

exports.createScalarType = createScalarType
exports.createStringType = createStringType
exports.createStringInputType = createStringInputType
exports.createStringOutputType = createStringOutputType
exports.createIntType = createIntType
exports.createIntInputType = createIntInputType
exports.createIntOutputType = createIntOutputType
exports.createFloatType = createFloatType
exports.createFloatInputType = createFloatInputType
exports.createFloatOutputType = createFloatOutputType
