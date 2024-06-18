const express = require('express');
const app = express();

// Data.
let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

// Express middleware.
app.use(express.json());

// Requests.
app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  const peopleCount = persons.length;
  const requestTime = new Date();
  const message = `<p>The phonebook has info for ${peopleCount} people.</p>
   <p>Time this information was requested: ${requestTime}.</p>`;

  response.send(message);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((item) => item.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((item) => item.id !== id);

  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  // Check to see if name entered by the user is already in phonebook.
  const name = persons.find(
    (item) => item.name.toLowerCase() === body.name.toLowerCase()
  );

  if (name) {
    return response
      .status(400)
      .json({ error: 'The name you entered is already in the phonebook.' });
  }

  // Check to see that both name and number fields have been filled in.
  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: 'Name and number fields must be filled in.' });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});

// Helper method used to generate a new ID for each person that is added to the phonebook.
const generateId = () => {
  return Math.floor(Math.random() * 10000 + 5);
};

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
