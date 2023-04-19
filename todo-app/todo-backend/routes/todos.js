const express = require('express');
const { Todo } = require('../mongo')
const router = express.Router();
const redis = require('../redis')

/* GET todos listing. */
router.get('/', async (_, res) => {
  const wat = await redis.getAsync('added_todos')
  console.log(wat)
  const todos = await Todo.find({})
  res.send(todos);
});

/* POST todo to listing. */
router.post('/', async (req, res) => {
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  let addedTodos = await redis.getAsync('added_todos')
  if (!addedTodos) {
    const todos = await Todo.find({})
    addedTodos = todos.length
  }
  addedTodos ++
  await redis.setAsync('added_todos', addedTodos)
  res.send(todo);
});

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()
  let addedTodos = await redis.getAsync('added_todos')
  if (!addedTodos) {
    const todos = await Todo.find({})
    addedTodos = todos.length
  }
  addedTodos --
  await redis.setAsync('added_todos', addedTodos)
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {
  res.send(req.todo)
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {
  req.todo.text = req.body.text
  req.todo.done = req.body.done
  await req.todo.save()
  res.send(req.todo)
});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
