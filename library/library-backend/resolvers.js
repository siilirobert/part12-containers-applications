const Book = require('./models/Book')
const Author = require('./models/Author')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    authorCount: async () => Author.collection.countDocuments(),
    bookCount: async () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        return await Book.find({ author: author._id })
      }

      if (args.genre) {
        return await Book.find({ genres: args.genre }).populate('author')
      }

      return Book.find({}).populate('author')
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const authorsToReturn = authors.map(async (author) => {
        const booksByAuthor = await Book.find({ author: author._id })
        author.bookCount = booksByAuthor.length
        return author
      })
      return authorsToReturn
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      let author = await Author.findOne({ name: args.author })
      if (!author) {
        const newAuthor = new Author({
          name: args.author
        })
        try {
          author = await newAuthor.save()
        } catch (error) {
          throw new GraphQLError('Adding new author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
      }
      const book = new Book({ ...args, author: author._id })
      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Adding new book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      await book.populate('author')

      pubsub.publish('BOOK_ADDED', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const authorToEdit = await Author.findOne({ name: args.name })
      if (!authorToEdit) {
        return null
      }

      authorToEdit.born = args.setBornTo
      await authorToEdit.save()
      return authorToEdit
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })

      return user.save().catch((error) => {
        throw new GraphQLError('Creating the user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET),
        favoriteGenre: user.favoriteGenre
      }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}

module.exports = resolvers
