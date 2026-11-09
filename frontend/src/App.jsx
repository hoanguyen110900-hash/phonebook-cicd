import { useState, useEffect } from 'react'
import personsService from './services/persons'
import Notification from './components/Notification'
import './index.css'

const Filter = ({searchQuery,onSearchChange}) => {
  return (
    <div>
        filter shown with: <input value ={searchQuery} onChange={onSearchChange}/>
    </div>
  )
}

const PersonForm = ({onSubmit, newName, onNameChange, newNumber, onNumberChange}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value ={newName} onChange={onNameChange} />
      </div>
      <div>
        number: <input value ={newNumber} onChange={onNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form> )
}

const Persons = ({personToShow,removePerson}) => {
  return (
    <div>
      {personToShow.map(person => (
        <div key={person.id}>{person.name} {person.number} {'  '}
        <button onClick={() => removePerson(person.id, person.name)}>delete</button>
        </div>))}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState(null)


  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })},[])

  const addPerson = (event) => {
    event.preventDefault()
    const trimmedName = newName.trim()
    const trimmedNumber = newNumber.trim()
    const nameValidate = persons.some (person => 
      person.name.toLowerCase() === trimmedName.toLowerCase())
    const numberValidate = persons.some (person => 
      person.number === trimmedNumber)
    if (nameValidate && numberValidate) {alert (`${trimmedName} ${trimmedNumber} is already added to phonebook`)
      return}
    if (nameValidate && !numberValidate) {
      const confirmUpdate = window.confirm(
      `${trimmedName} is already added to the phonebook, replace the old number with a new one?`)
      if (confirmUpdate) {
        const targetPerson = persons.find(person => person.name.toLowerCase() === trimmedName.toLowerCase())
        const updatePersonObjt = {...targetPerson, number:trimmedNumber}
        personsService
          .update(targetPerson.id, updatePersonObjt)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== targetPerson.id ? person:returnedPerson))
            setNewName('')
            setNewNumber('')
            setNotification({message:`Updated '${returnedPerson.name}'`, type: 'success'})
            setTimeout(() => {setNotification(null)}, 3000)
            })
          .catch(error => {
            if (error.response && error.response.status === 400) {
              setNotification({ message: error.response.data.error, type: 'error' })
              setTimeout(() => {setNotification(null)}, 3000)}
            else{
              setNotification({message:`Information of '${targetPerson.name}' has already been removed from the server`, type: 'error'})
              setPersons(persons.filter(person => person.id !== targetPerson.id))
              setTimeout(() => {setNotification(null)}, 3000)}
            })}
      return}

    const personObject = {
      name: trimmedName,
      number: trimmedNumber
    }

    personsService
      .create(personObject)
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        setNotification({message: `Added '${returnedPerson.name}'`, type:'success'})
        setTimeout(() => {setNotification(null)}, 3000)})
      .catch(error => {
        console.log(error.response.data)
        const errorMessage = error.response?.data?.error || 'Failed to add contact'
        setNotification({message:errorMessage, type: 'error'})
        setTimeout(() => {setNotification(null)}, 3000)})
  }

  const toggleRemove = (id, name) => {
    const clearToDelete = window.confirm(`Remove ${name}?`)
    if (!clearToDelete) return
    personsService
      .remove(id)
      .then(() => {
        setPersons(persons.filter(p => p.id !== id))
        setNotification({message:'Deleted successfully', type: 'success'})
        setTimeout(() => {setNotification(null)}, 3000)})}

  const personToShow = persons.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)}
  const handleNameChange = (event) => {
    setNewName(event.target.value)}
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)}

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notification?.message} type={notification?.type}/>

      <Filter searchQuery={searchQuery} 
              onSearchChange={handleSearchChange}/>

      <h3>Add a new</h3>

      <PersonForm onSubmit={addPerson} 
                  newName={newName}
                  onNameChange={handleNameChange} 
                  newNumber={newNumber} 
                  onNumberChange={handleNumberChange}/>

      <h3>Numbers</h3>

      <Persons personToShow={personToShow} removePerson={toggleRemove}/>
      
    </div>
  )
}
export default App