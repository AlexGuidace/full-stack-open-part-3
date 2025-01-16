// Load environment variables into process.env.
require('dotenv').config();
const express = require('express');
const app = express();
// Enables our Express server (on port 3001) to connect to the external frontend (hosted on port 5173).
const cors = require('cors');
// HTTP request logger middleware.
const morgan = require('morgan');
const Person = require('./models/person');

// Custom morgan token specifically used for logging payload data that was sent in POST requests.
morgan.token('payloadData', (request, response) => {
  return JSON.stringify(request.body);
});

// Middleware function used to generate a morgan middleware function for logging POST request payload data using the above morgan token.
const postLogger = (request, response, next) => {
  if (request.method === 'POST') {
    // Generate a morgan function using the current Express middleware function signature values--(request, response, next); this is a general syntax pattern in Express apps for use with middleware generators like morgan.
    morgan(
      ':method :url :status :res[content-length] - :response-time ms payloadData: :payloadData'
    )(request, response, next);
  } else {
    next();
  }
};

// Express middleware.
app.use(express.static('dist'));
app.use(cors());
app.use(express.json());
app.use(postLogger);

// Routes.
app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

///////////// COMMENTED OUT SOME CODE FOR EXERCISE 3.14. /////////////
// app.get('/info', (request, response) => {
//   const peopleCount = persons.length;
//   const requestTime = new Date();
//   const message = `<p>The phonebook has info for ${peopleCount} people.</p>
//    <p>Time this information was requested: ${requestTime}.</p>`;

//   response.send(message);
// });

// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id);
//   const person = persons.find((item) => item.id === id);

//   if (person) {
//     response.json(person);
//   } else {
//     response.status(404).end();
//   }
// });

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      const deletedPerson = {
        id: result._id.toString(),
        name: result.name,
        number: result.number,
      };

      response.json(deletedPerson);
    })
    // No custom handlers implemented for errors in this app yet.
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  // Check to see if name entered by the user is already in phonebook.
  //   const name = persons.find(
  //     (item) => item.name.toLowerCase() === body.name.toLowerCase()
  //   );

  //   if (name) {
  //     return response
  //       .status(400)
  //       .json({ error: 'The name you entered is already in the phonebook.' });
  //   }

  // Check to see that both name and number fields have been filled in.
  if (!body.name || !body.number) {
    return response
      .status(400)
      .json({ error: 'Name and number fields must be filled in.' });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
