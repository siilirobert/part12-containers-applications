import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS_BY_GENRE, CURRENT_USER } from '../queries'
import { useEffect } from 'react'

const Recommendations = (props) => {
  const favoriteGenreResult = useQuery(CURRENT_USER)

  const [getByGenre, byGenreResult] = useLazyQuery(ALL_BOOKS_BY_GENRE)

  useEffect(() => {
    if (favoriteGenreResult.data) {
      getByGenre({ variables: { genre: favoriteGenreResult.data.me.favoriteGenre } })
    }
  }, [favoriteGenreResult.data]) //eslint-disable-line

  if (!props.show) {
    return null
  }

  if (favoriteGenreResult.loading || byGenreResult.loading) {
    return <div>loading...</div>
  }

  const books = byGenreResult.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <strong>{favoriteGenreResult.data.me.favoriteGenre}</strong>
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
    </div>
  )
}

export default Recommendations
