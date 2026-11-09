import assert from 'node:assert/strict'
import { test } from 'node:test'
import axios from 'axios'
import personsService from '../src/services/persons.js'

test('getAll returns the contacts from the API response', async (t) => {
  const persons = [{ id: '1', name: 'Ada Lovelace', number: '040-1234567' }]
  const get = t.mock.method(axios, 'get', async () => ({ data: persons }))

  const result = await personsService.getAll()

  assert.deepEqual(result, persons)
  assert.equal(get.mock.callCount(), 1)
  assert.deepEqual(get.mock.calls[0].arguments, ['/api/persons'])
})

test('create sends a contact and returns the saved contact', async (t) => {
  const person = { name: 'Ada Lovelace', number: '040-1234567' }
  const savedPerson = { ...person, id: '1' }
  const post = t.mock.method(axios, 'post', async () => ({ data: savedPerson }))

  const result = await personsService.create(person)

  assert.deepEqual(result, savedPerson)
  assert.equal(post.mock.callCount(), 1)
  assert.deepEqual(post.mock.calls[0].arguments, ['/api/persons', person])
})

test('getAll propagates API failures', async (t) => {
  const error = new Error('API unavailable')
  t.mock.method(axios, 'get', async () => { throw error })

  await assert.rejects(personsService.getAll(), error)
})
