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
    type: `Expecting "${name}" to be string.`,
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
    type: `Expecting "${name}" to be integer.`,
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
  const { min, max, minDecimals, maxDecimals, test } = validate || {}

  const defaultMessages = {
    type: `Expecting "${name}" to be float number.`,
    min: `Minimum number for "${name}" is ${min}.`,
    max: `Maximum number for "${name}" is ${max}.`,
    minDecimals: `The float number "${name}" should have at least ${minDecimals} decimals.`,
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
  if (minDecimals && decimals.length < minDecimals) {
    throw new GraphQLTypeError(messages.minDecimals)
  }
  if (maxDecimals && decimals.length > maxDecimals) {
    throw new GraphQLTypeError(messages.maxDecimals)
  }
  if (test && !test(value)) {
    throw new GraphQLTypeError(messages.test)
  }
}

const createScalarType = (attrs, handler) => {
  const direction = attrs.direction || DIRECTION_INPUT
  return new GraphQLScalarType({
    name: attrs.name,
    description: attrs.description,
    // Gets invoked when serializing the result to send it back to the client.
    serialize (value) {
      if (direction === DIRECTION_OUTPUT || direction === DIRECTION_BOTH) {
        return handler(value, attrs)
      }
      return value
    },
    // Gets invoked to parse client input that was passed through variables.
    parseValue (value) {
      if (direction === DIRECTION_INPUT || direction === DIRECTION_BOTH) {
        return handler(value, attrs)
      }
      return value
    },
    // Gets invoked to parse client input that was passed inline in the query.
    parseLiteral (ast) {
      if (direction === DIRECTION_INPUT || direction === DIRECTION_BOTH) {
        return handler(ast.value, attrs, ast)
      }
      return ast.value
    }
  })
}

const createStringType = (attrs) => {
  return createScalarType(attrs, (value) => {
    assertString(value, attrs)
    return value
  })
}

const createIntType = (attrs) => {
  return createScalarType(attrs, (value) => {
    assertInt(value, attrs)
    return Number(value)
  })
}

const createFloatType = (attrs) => {
  return createScalarType(attrs, (value) => {
    assertFloat(value, attrs)
    return Number(value)
  })
}

exports.DIRECTION_INPUT = DIRECTION_INPUT
exports.DIRECTION_OUTPUT = DIRECTION_OUTPUT
exports.DIRECTION_BOTH = DIRECTION_BOTH

exports.GraphQLTypeError = GraphQLTypeError

exports.createScalarType = createScalarType
exports.createStringType = createStringType
exports.createIntType = createIntType
exports.createFloatType = createFloatType
