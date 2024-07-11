// Command-line phonebook database.
// Run this file from the command-line using 'node mongo.js yourPassword'. Optionally, enter the name and phone number of the person being entered into the database, after your password.

const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log(
    'You need to add your password as an argument on the command line.'
  );
  process.exit(1);
}

const password = process.argv[2];

// Database connection string.
const dbConnectionUrl = `mongodb+srv://alexguidace:${password}@cluster0-full-stack-ope.2rka82t.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0-Full-Stack-Open`;

mongoose.set('strictQuery', false);

mongoose.connect(dbConnectionUrl);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name: process.argv[3],
  number: process.argv[4],
});

person.save().then((saveResult) => {
  console.log(saveResult);
  mongoose.connection.close();
});
