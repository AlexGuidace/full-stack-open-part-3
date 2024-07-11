// Command-line phonebook database.
// Run this file from the command-line using 'node mongo.js yourPassword'. If you are entering a new person into the phonebook, enter their name and phone number (separated by a space) after your password. If a name contains whitespace, wrap the name in quotes. If you want to see all entries in the phonebook, simply enter your password.

const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log(
    'You need to add your password as an argument on the command-line.'
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

// If no entry is provided from the command-line, return all entries in the phonebook. Otherwise, create a new entry in the phonebook.
if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    console.log('Phonebook: ');
    result.forEach((person) => {
      console.log(`${person.name}: ${person.number}`);
    });
    mongoose.connection.close();
  });
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  person.save().then((saveResult) => {
    console.log(
      `Added '${saveResult.name}' with phone number '${saveResult.number}' to the phonebook.`
    );
    mongoose.connection.close();
  });
}
