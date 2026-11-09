const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: [true, 'Name required'] },
  number: {
    type: String,
    minLength: 8,
    validate: { validator: function(v) {
      return /^\d{2,3}-\d+$/.test(v)
    },
    required: [true, 'Phone number required']
    } }
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
