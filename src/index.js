const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
//ok
function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(400).json({error: "username not found!"})
  }
  
  request.user = user;

  return next();
}
//ok
app.post('/users', (request, response) => {
  const { name, username } = request.body;
  
  const existingUser = users.some((user) => user.username === username); 

  if (existingUser) {
    return response.status(400).json({error: "User already exists!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)

});
//ok
app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});
//doing
app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  };

  user.todos.push(todo);

  return response.status(201).json(todo);

});
//ok
app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  
  const todo = user.todos.find((todo) => todo.id === id)

  if(!todo) {
    return response.status(404).json({error: "invalid to_do id"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});
//
app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "invalid to_do id"});
  }

  todo.done = true;

  return response.json(todo);

});

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: "invalid to_do id"});
  };

  user.todos.splice(todo, 1);

  // user.todo.splice(todos, 1);

  return response.sendStatus(204);
  

});

module.exports = app;