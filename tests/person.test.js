const { test } = require('node:test')
const assert = require('node:assert/strict')
const Person = require('../models/person')

test('accepts a valid person', async () => {
  const person = new Person({ name: 'Ada Lovelace', number: '040-1234567' })

  await person.validate()
})

test('rejects a name shorter than three characters', async () => {
  const person = new Person({ name: 'Al', number: '040-1234567' })

  await assert.rejects(person.validate(), error => Boolean(error.errors.name))
})

test('rejects a phone number without the required hyphen', async () => {
  const person = new Person({ name: 'Ada Lovelace', number: '0401234567' })

  await assert.rejects(person.validate(), error => Boolean(error.errors.number))
})

test('serializes the id without MongoDB internal fields', () => {
  const person = new Person({ name: 'Ada Lovelace', number: '040-1234567', __v: 0 })
  const json = person.toJSON()

  assert.equal(json.id, person._id.toString())
  assert.equal(json.name, 'Ada Lovelace')
  assert.equal(json.number, '040-1234567')
  assert.equal(Object.hasOwn(json, '_id'), false)
  assert.equal(Object.hasOwn(json, '__v'), false)
})
