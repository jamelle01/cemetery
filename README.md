# Storm Lake Cemetery (sl-cem)

An interactive map application for the Storm Lake cemetery.

## Quick setup

To begin development do the following:

Install npm, bower & PostgreSQL

Then,

```
git clone https://github.com/jbshep/sl-cem.git

cd sl-cem

npm install

bower install

npm install -g db-migrate
```

Next, create a PostgreSQL database named slcem.

Modify database.json with the credentials for your PostgreSQL

Finally, 

```
db-migrate up
```

## Populating the database

In order to populate the database with data, developers must have access to cemetery data in the form of a CSV file.  This CSV file is not part of the GitHub repository.  The CSV file should reside at docs/cemetery.csv.  Then, the developer should enter the utils directory and type 'node db-populate.js'. 

## Running the application

Run the application by typing

```
node bin/www
```

or, if you have nodemon installed, type

```
nodemon bin/www
```

## Contributing to this application

BVU students who wish to contribute code to this project should make every effort to follow the [Airbnb JavaScript Style Guide for ES5](https://github.com/airbnb/javascript/tree/master/es5).  Once Node.js more reliably supports ES6, we may choose to migrate to the newest style guide.
