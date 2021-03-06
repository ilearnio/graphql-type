## graphql-type

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

Helper functions for fast creation of graphql types with validation of input or output (or both) values.

In most cases you would want to performs bi-directional validation of data, so that invalid input value will result in an error response, whereas in case of invalid output it will **always** return the value but will also let you know of the error.

For bi-direction validation use function like `createStringType`. For uni-directional validation use `createStringInputType` or `createStringOutputType`.

##### Strings

```js
const { createStringType } = require('graphql-type')

const EmailType = createStringType({
  // Name of the type
  name: 'EmailType',
  // Description
  description: 'Email with validation rules.', // (optional)
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
  // Allows to modify or log (or whatnot) the value
  resolve (value) {
    return value
  }
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
  // Allows to modify or log (or whatnot) the value
  resolve (value) {
    return value
  }
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
    maxDecimals: 4,
    // Custom validation function
    test: function ...,
  },
  // Custom error messages
  validationMessages: { ... },
  // Allows to modify or log (or whatnot) the value
  resolve (value) {
    return value
  }
})
```

Available helper functions:

```js
// Strings
createStringType(attrs)
createStringInputType(attrs)
createStringOutputType(attrs)

// Integers
createIntType(attrs)
createIntInputType(attrs)
createIntOutputType(attrs)

// Floats
createFloatType(attrs)
createFloatInputType(attrs)
createFloatOutputType(attrs)
```

[npm-image]: https://img.shields.io/npm/v/graphql-type.svg
[npm-url]: https://npmjs.org/package/graphql-type
[travis-image]: https://img.shields.io/travis/ilearnio/graphql-type/master.svg
[travis-url]: https://travis-ci.org/ilearnio/graphql-type
