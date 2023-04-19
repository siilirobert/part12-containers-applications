import { useLazyQuery, useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_BOOKS_BY_GENRE } from '../queries'
import { useState } from 'react'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)

  const [getByGenre, byGenreResult] = useLazyQuery(ALL_BOOKS_BY_GENRE)

  const [genreFilter, setGenreFilter] = useState(null)

  const changeGenre = (genre) => {
    setGenreFilter(genre)
    getByGenre({ variables: { genre } })
  }

  if (!props.show) {
    return null
  }

  if (result.loading || byGenreResult.loading) {
    return <div>loading...</div>
  }

  const books = genreFilter ? byGenreResult.data.allBooks : result.data.allBooks

  const genres = result.data.allBooks.map((book) => {
    return book.genres
  })

  const uniqueGenres = [...new Set(genres.flat())]

  return (
    <div>
      <h2>books</h2>

      <p>
        in genre <strong>{genreFilter ? genreFilter : 'all'}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {uniqueGenres.map((genre) => (
          <button key={genre} onClick={() => changeGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setGenreFilter(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
