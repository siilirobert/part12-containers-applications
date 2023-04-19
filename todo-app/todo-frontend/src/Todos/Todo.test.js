import React from 'react'
import Todo from './Todo'
import { render } from '@testing-library/react'

test('renders content', () => {
  const todo = {
    text: 'Component testing is done with react-testing-library',
    important: false
  }

  const { container } = render(
    <Todo todo={todo} onClickComplete={() => null} onClickDelete={() => null} />
  )

  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  const div = container.querySelector('.todo')
  expect(div).toHaveTextContent('Component testing is done with react-testing-library')
})
