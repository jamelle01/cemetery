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
