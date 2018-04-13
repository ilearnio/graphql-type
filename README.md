## GraphQL Type

Helps to create graphql types fast, and to validate input or output (or both) data.

##### Strings

```js
const { createStringType } = require('graphql-type')

const EmailInputType = createStringType({
  // Name of the type
  name: 'EmailInputType',
  // Description
  description: 'Validates email.', // (optional)
  // Validation rules
  validate: {
    // Min length
    min: 5,
    // Max length
    max: 100,
    // Regex validation
    regexp: /^\w+@\w+\.[a-z]{2,}$/i,
    // Custom validation function
    test (value) {
      // Disallow emails that end with '@example.com'
      return !value.endsWith('@example.com')
    }
  },
  // Custom error messages
  validationMessages: {
    min: 'Email should have at least 5 characters.',
    test: 'Test domains are not allowed.'
  },
  // Validate input or output data? (default is 'input')
  direction: 'input' // 'input', 'output', 'both'
})
```

##### Integers

```js
const MyInt = createIntType({
  // Name of the type
  name: 'MyInt',
  // Description
  description: '', // (optional)
  // Validation rules
  validate: {
    // Min number
    min: 5,
    // Max number
    max: 100,
    // Custom validation function
    test: function ...,
  },
  // Custom error messages
  validationMessages: { ... },
  // Validate input or output data? (default is 'input')
  direction: 'input' // 'input', 'output', 'both'
})
```

##### Floats

```js
const MyFloat = createFloatType({
  // Name of the type
  name: 'MyFloat',
  // Description
  description: '', // (optional)
  validate: {
    // Min number
    min: 5,
    // Max number
    max: 100,
    // Max decimal characters length
    minDecimals: 2,
    // Max decimal characters length
    maxDecimals: 4,
    // Custom validation function
    test: function ...,
  },
  // Custom error messages
  validationMessages: { ... },
  // Validate input or output data? (default is 'input')
  direction: 'input' // 'input', 'output', 'both'
})
```

##### Scalar type

If none of the above satisfy your needs, you can create your own Scalar type (`GraphQLScalarType`) using `createScalarType`:

```js
const { GraphQLError } = require('graphql/error')
const { createScalarType, DIRECTION_OUTPUT } = require('graphql-type')

const MuliplyNumberType = createScalarType({
  name: 'MuliplyNumberType',
  direction: DIRECTION_OUTPUT,
  // custom attributes
  multiplyBy: 10
}, function handler (value, attrs, ast) {
  // Do some assertions
  if (isNaN(value) || ast) {
    throw new GraphQLError(`Expecting numeric value.`)
  }
  if (value < 5) {
    throw new GraphQLError(`Value must be more then 5.`)
  }

  // It's up to you what will be the result value.
  return value * attrs.multiplyBy
})
```

##### Useful Constants

For `direction` you can also use the following constants: `DIRECTION_INPUT`, `DIRECTION_OUTPUT`, `DIRECTION_BOTH`
