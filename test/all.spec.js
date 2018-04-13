/* eslint-env mocha */

const { AssertionError } = require('assert')
const { expect } = require('chai')
const { graphql } = require('graphql')
const schema = require('./schema')
const { createIntType } = require('..')

const query = (queryStr, variables) => {
  return graphql(schema, queryStr, null, null, variables)
}

let result

describe('StringType', function () {
  it('should validate "min"', async () => {
    result = await query(`{ testStringInputType(string: "1234") }`)
    expect(result.errors[0].message).to.match(/min error$/)
    result = await query(`{ testStringInputType(string: "12345") }`)
    expect(result.errors[0].message).to.match(/regexp error$/)
  })

  it('should validate "max"', async () => {
    result = await query(`{ testStringInputType(string: "123456789012345") }`)
    expect(result.errors[0].message).to.match(/regexp error$/)
    result = await query(`{ testStringInputType(string: "1234567890123456") }`)
    expect(result.errors[0].message).to.match(/max error$/)
  })

  it('should validate "regexp"', async () => {
    result = await query(`{ testStringInputType(string: "foo@@bar.com") }`)
    expect(result.errors[0].message).to.match(/regexp error$/)
  })

  it('should validate "test"', async () => {
    result = await query(`{ testStringInputType(string: "foo@example.com") }`)
    expect(result.errors[0].message).to.match(/test error$/)
  })

  it('should pass validation', async () => {
    result = await query(`{ testStringInputType(string: "foo@bar.com") }`)
    expect(result.data.testStringInputType).to.equal('OK')
  })
})

describe('IntInputType', function () {
  it('should validate "min"', async () => {
    result = await query(`{ testIntInputType(int: 9) }`)
    expect(result.errors[0].message).to.match(/min error$/)
    result = await query(`{ testIntInputType(int: 10) }`)
    expect(result.errors[0].message).to.match(/test error$/)
  })

  it('should validate "max"', async () => {
    result = await query(`{ testIntInputType(int: 101) }`)
    expect(result.errors[0].message).to.match(/max error$/)
  })

  it('should validate "test"', async () => {
    result = await query(`{ testIntInputType(int: 50) }`)
    expect(result.errors[0].message).to.match(/test error$/)
  })

  it('should pass validation', async () => {
    result = await query(`{ testIntInputType(int: 60) }`)
    expect(result.data.testIntInputType).to.equal('OK')
  })
})

describe('FloatInputType', function () {
  it('should validate float number', async () => {
    result = await query(`{ testFloatInputType(int: 10) }`)
    expect(result.errors[0].message).to.match(/type error$/)
  })

  it('should validate "min"', async () => {
    result = await query(`{ testFloatInputType(int: 10.54) }`)
    expect(result.errors[0].message).to.match(/min error$/)
    result = await query(`{ testFloatInputType(int: 10.55) }`)
    expect(result.errors[0].message).to.match(/test error$/)
  })

  it('should validate "max"', async () => {
    result = await query(`{ testFloatInputType(int: 101.11) }`)
    expect(result.errors[0].message).to.match(/max error$/)
  })

  it('should validate "minDecimals"', async () => {
    result = await query(`{ testFloatInputType(int: 15.5) }`)
    expect(result.errors[0].message).to.match(/minDecimals error$/)
  })

  it('should validate "maxDecimals"', async () => {
    result = await query(`{ testFloatInputType(int: 15.12345) }`)
    expect(result.errors[0].message).to.match(/test error$/)
    result = await query(`{ testFloatInputType(int: 15.123456) }`)
    expect(result.errors[0].message).to.match(/maxDecimals error$/)
  })

  it('should validate "test"', async () => {
    result = await query(`{ testFloatInputType(int: 75.55) }`)
    expect(result.errors[0].message).to.match(/test error$/)
  })

  it('should pass validation', async () => {
    result = await query(`{ testFloatInputType(int: 90.55) }`)
    expect(result.data.testFloatInputType).to.equal('OK')
  })
})

describe('Input-only validation direction', function () {
  it('should validate input', async () => {
    result = await query(`{ testIntInputOnlyType(int: 9) }`)
    expect(result.errors[0].message).to.match(/min error$/)
  })

  it('should NOT validate output', async () => {
    result = await query(`{ testIntInputOnlyType(int: 60) }`)
    expect(result.data.testIntInputOnlyType).to.equal('not int')
    expect(result.errors).to.equal(undefined)
  })
})

describe('Output-only validation direction', function () {
  it('should NOT allow input', async () => {
    result = await query(`{ testIntOutputOnlyType(int: 60) }`)
    expect(result.errors[0].message).to.match(/must be Output Type but got input/)
    expect(result.data).to.equal(undefined)
  })
})

describe('Bi-directional validation', function () {
  it('should validate input', async () => {
    result = await query(`{ testIntBiDirectionalType(int: 9) }`)
    expect(result.data).to.equal(undefined)
    expect(result.errors[0].message).to.match(/min error$/)
  })

  it('should always return value, even on output validation error', async () => {
    result = await query(`{ testIntBiDirectionalType(int: 91) }`)
    expect(result.data.testIntBiDirectionalType).to.equal(9)
    // TODO: currently error is only logged to terminal
    // expect(result.errors[0].message).to.match(/min error$/)
  })
})

describe('Type creators', function () {
  it('should require "name" attribute', () => {
    expect(() => createIntType({ })).to.throw(AssertionError, 'Must provide name.')
  })

  it('should throw on unknown attribute', () => {
    expect(() => createIntType({ name: 'Foo', bar: 1 })).to.throw(AssertionError,
      'Unknown attribute "bar" set for "Foo" type.')
  })
})

describe('Other', function () {
  it('should validate passed variable', async () => {
    result = await query(`query ($int: IntInputType) { testIntInputType(int: $int) }`, { int: 9 })
    expect(result.errors[0].message).to.match(/min error$/)
    result = await query(`query ($int: IntInputType) { testIntInputType(int: $int) }`, { int: 60 })
    expect(result.data.testIntInputType).to.equal('OK')
  })
})
