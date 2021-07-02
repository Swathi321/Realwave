# Realwave
Realwave provides an elegant, easy to use portal to view real time video content based on data collected from the various systems in the enterprise. 
This revolutionary cloud based solution is quick to install, leverages existing infrastructure and applies cutting edge technology, AI/ML & analytics, to automate & maximize the efficiency of your video surveillance application.

### Checkout Link
> https://github.com/RealWaveIO/ServerCode.git

### Tech

Realwave:

* [React] (16.8.6) - A JavaScript library for building user interfaces
* [Node] (12.x or latest) - A JavaScript Runtime (NodeJs) for building server
* [MongoDB] (4.2 or latest) - NoSQL Database

### Installation

Realwave requires [NodeJS] to run.

Install the dependencies and devDependencies and start the server.
- Install Node JS - (https://nodejs.org/en/)

### Frontend
    cd Frontend
    npm install
    npm start

### Backend
    cd Backend
    npm install
    node app.js

### Database
To restore the db: Make sure you installed mongodb and nosql booster tool and mongo tools.
- Install Mongo DB (https://www.mongodb.com/try/download/community)
- Install MongoBooster for database access (IDE) - (https://nosqlbooster.com/downloads)
- Install Mongo Tools for Mongo DB backup and restore - (https://www.mongodb.com/try/download/database-tools)
- You need to extract the zip file of the local db in your local: Go to servercode folder > db > dump : There is a file realwave.7z extract this.
- To restore it: Go to mongo tools folder > Open cmd >  Type below command
- {datapath} - Local db path which you have extract on your local

		mongorestore --db realwave ${datapath}
		
### Database Connection String

		mongodb://{username}:{password}@{server}:27017/{database}?authSource={username}
		mongodb://demo:demo123@demo.realwave.io:27017/realwave-db?authSource=demo
  
### Note
> For hitting API's from your local backend, you need to change baseurl in serverApi.js file. Just uncomment this line and change the port according to your backend on which port it started, by default it's 5001:
- baseUrl = (baseUrl.indexOf("localhost") != -1) ? 'http://localhost:5001/' : baseUrl;

Local site will run

    http://localhost:3000