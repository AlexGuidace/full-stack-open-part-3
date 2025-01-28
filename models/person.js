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
  number: String,
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
