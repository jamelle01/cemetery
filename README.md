# sl-cem

Interactive map application for Storm Lake cemetery.

## Quick setup

To begin development do the following:

Install npm, bower & PostgreSQL

Then,

```
git clone https://github.com/jbshep/sl-cem.git

npm install

bower install

npm install -g db-migrate
```

Next, create a PostgreSQL database named sl-cem.

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

