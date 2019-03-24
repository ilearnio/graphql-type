/* eslint-env mocha */

const { AssertionError } = require('assert')
const { expect } = require('chai')
const { stubConsoleOnBeforeEach } = require('./utils/console')
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
  context('when has input "min" error', () => {
    it('should validate input', async () => {
      result = await query(`{ testIntBiDirectionalType(int: 9) }`)
      expect(result.data).to.equal(undefined)
      expect(result.errors[0].message).to.match(/min error$/)
    })
  })

  context('when has output "min" error', () => {
    const consoleStubbed = stubConsoleOnBeforeEach(['error'])

    it('should always return value, even on output validation error', async () => {
      result = await query(`{ testIntBiDirectionalType(int: 91) }`)
      expect(result.data.testIntBiDirectionalType).to.equal(9)
      // TODO: currently error is only logged to terminal
      // expect(result.errors[0].message).to.match(/min error$/)
    })

    it('calls console.error', async () => {
      result = await query(`{ testIntBiDirectionalType(int: 91) }`)
      expect(consoleStubbed.error.callCount).to.eq(1)
      expect(consoleStubbed.error.firstCall.args).to.have.lengthOf(1)
      expect(consoleStubbed.error.firstCall.args[0]).to.have.property('message', 'min error')
    })
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

describe('Query variables', function () {
  it('should validate passed variable', async () => {
    result = await query(`query ($int: IntInputType) { testIntInputType(int: $int) }`, { int: 9 })
    expect(result.errors[0].message).to.match(/min error$/)
    result = await query(`query ($int: IntInputType) { testIntInputType(int: $int) }`, { int: 60 })
    expect(result.data.testIntInputType).to.equal('OK')
  })
})

describe('Value resolver', () => {
  describe('#createStringType', async () => {
    let result
    beforeEach(async () => {
      result = await query(`query ($string: StringBiDirectionalWithResolver) {
        testStringBiDirectionalWithResolverType(string: $string)
      }`, { string: 'passed-arg' })
    })

    it('resolves "passed-arg" that was modified by input type resolver, query resolver and output type resolver', () => {
      expect(result.data.testStringBiDirectionalWithResolverType)
        .to.equal('typeResolver: (queryResolver: (typeResolver: (passed-arg)))')
    })
  })

  describe('#createIntType', async () => {
    let result
    beforeEach(async () => {
      result = await query(`query ($int: IntBiDirectionalWithResolver) {
        testIntBiDirectionalWithResolverType(int: $int)
      }`, { int: 100 })
    })

    it('resolves value that was modified by input type resolver, query resolver and output type resolver', () => {
      expect(result.data.testIntBiDirectionalWithResolverType).to.equal(4000) // 100 * 2 * 10 * 2
    })
  })

  describe('#createFloatType', async () => {
    let result
    beforeEach(async () => {
      result = await query(`query ($float: FloatBiDirectionalWithResolver) {
        testFloatBiDirectionalWithResolverType(float: $float)
      }`, { float: 100.22 })
    })

    it('resolves value that was modified by input type resolver, query resolver and output type resolver', () => {
      expect(result.data.testFloatBiDirectionalWithResolverType).to.equal(4008.8) // 100.22 * 2 * 10 * 2
    })
  })
})
