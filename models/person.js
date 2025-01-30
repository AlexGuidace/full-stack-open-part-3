// Configure and connect to Person model for MongoDB database.
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log(`Connecting to database: ${url}`);

mongoose
  .connect(url)
  .then((result) => {
    console.log('Connected to MongoDB database.');
  })
  .catch((error) => {
    'Error connecting to MongoDB database: ', error.message;
  });

const personSchema = new mongoose.Schema({
  name: { type: String, minLength: 3 },
  number: {
    type: String,
    minLength: 8,
    // Validator test to make sure the phone number follows a specific format.
    validate: {
      validator: function (value) {
        return /^\d{2,3}-\d+$/.test(value);
      },
      // If the validator test fails, an error object is created by Mongoose and passed to this message function. The error object is props. And props.value is the value that failed the test.
      message: (props) =>
        `${props.value} is not a valid phone number. Please enter your number in the following format: 2-3 digits to start, followed by a -, followed by any number number of digits. E.g., 45-30993825.`,
    },
  },
});

// Transform each ID object into a string to avoid problems with ID objects later.
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Export our Mongoose model for use in index.js.
module.exports = mongoose.model('Person', personSchema);
