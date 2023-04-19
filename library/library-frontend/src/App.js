import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { useApolloClient, useSubscription } from '@apollo/client'
import { BOOK_ADDED, ALL_BOOKS, ALL_BOOKS_BY_GENRE } from './queries'

export const updateCache = (cache, query, addedBook) => {
  console.log(query)
  // helper that is used to eliminate saving same book twice
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, (data) => {
    console.log(data)
    if (data) {
      return {
        allBooks: uniqByTitle(data.allBooks.concat(addedBook))
      }
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('books')
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      window.alert(`Book added: ${addedBook.title}`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
      addedBook.genres.forEach((genre) => {
        updateCache(
          client.cache,
          {
            query: ALL_BOOKS_BY_GENRE,
            variables: {
              genre
            }
          },
          addedBook
        )
      })
    }
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        {token && (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommendations')}>recommendations</button>
            <button onClick={logout}>logout</button>
          </>
        )}

        {!token && <button onClick={() => setPage('login')}>login</button>}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} setPage={setPage} />

      <LoginForm setToken={setToken} setPage={setPage} show={page === 'login'} />

      <Recommendations show={page === 'recommendations'} />
    </div>
  )
}

export default App
