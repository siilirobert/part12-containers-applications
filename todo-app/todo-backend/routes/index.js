const express = require('express');
const router = express.Router();
const redis = require('../redis')

const configs = require('../util/config')

let visits = 0

/* GET index data. */
router.get('/', async (req, res) => {
  visits++

  res.send({
    ...configs,
    visits,
    test: "asd"
  });
});

router.get('/statistics', async (req, res) => {
  const addedTodos = await redis.getAsync('added_todos')
  const returnValue = addedTodos ? parseInt(addedTodos, 10) : 0
  res.status(200).json({
    "added_todos": returnValue
  })
})

module.exports = router;
