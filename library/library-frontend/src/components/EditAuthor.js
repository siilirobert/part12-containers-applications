import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, EDIT_BIRTHYEAR } from '../queries'

const EditAuthor = ({ authors }) => {
  const [name, setName] = useState(authors[0]?.name)
  const [birthYear, setBirthYear] = useState('')

  const [editBirthYear] = useMutation(EDIT_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const submit = (event) => {
    event.preventDefault()

    editBirthYear({ variables: { name, born: Number(birthYear) } })
    setName('')
    setBirthYear('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <select value={name} onChange={({ target }) => setName(target.value)}>
          {authors.map((author) => (
            <option key={author.name} value={author.name}>
              {author.name}
            </option>
          ))}
        </select>
        <div>
          born
          <input value={birthYear} onChange={({ target }) => setBirthYear(target.value)} />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default EditAuthor
