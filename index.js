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
app.get('/info', (request, response, next) => {
  const infoRequestTime = new Date();

  Person.countDocuments()
    .then((documentCount) => {
      const infoMessage = `<p>The phonebook has information for ${documentCount} people.</p> <p>Time this information was requested: ${infoRequestTime}.</p>`;

      response.send(infoMessage);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;

  Person.findById(id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      const deletedPerson = {
        id: result._id.toString(),
        name: result.name,
        number: result.number,
      };

      // Send client formatted deletedPerson after deletion in database in order to update the UI with updated phonebook.
      response.json(deletedPerson);
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
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

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  // Set { new: true }, in order to get the updated person back in the response (we want the NEW person to be sent back to us, right?). Otherwise, the original person document is sent back in the response. This is an idiosyncrasy of Mongoose.
  // Secondly, validators (validation checks for fields we want to update, e.g. a Person object field) are not run by default in Mongoose for findOneAndUpdate() and similar methods, so we manually set the validators (and set the correct 'context' for them below as well so the validators work correctly) below.
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((returnedUpdate) => {
      response.json(returnedUpdate);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.log('Error from error handler: ', error.message);

  // If a person's id was malformed in the route's endpoint, we specifically address it here.
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' });
  } else if ((error.name = 'ValidationError')) {
    return response.status(400).json({ error: error.message });
  }

  // If the conditions above are not met, no response is sent back to the client by them, so we run the next(error) line below. If no other custom error handlers are defined by me, next(error) will send a generic, default error response to the client, like a 500 status code.
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
