# nodejs_restify_sample

This is a "starter" Node.js Restify server application.
Use this as a template to rapidly develop your own Node.js server endpoint.
Demonstrates:
 - reading / writing files to implement a persistent counter
   - i.e. the values persist even if the Node.js service is stopped and restarted
 - making REST API request
   - i.e. we perform a simple query to ArcGIS Online
 - invoking a Unix shell command
   - i.e. we display the output of Unix shell command
 - async/await with Promises.
   - we avoid callbackhell by implementing some of the end points using async/await and Promise-fied functions

## Installation

```bash
npm install # needed for first time only
npm start # starts the Restify server on port 6080
```

## Overview

```bash
curl http://localhost:6080/version # display current version of the app
curl http://localhost:6080/info # display system information
curl http://localhost:6080/echo # displays a copy of the request as the response
curl http://localhost:6080/uptime # displays Unix uptime
curl http://localhost:6080/counter # persistent counter
curl http://localhost:6080/arcgis # make an ArcGIS Online REST API call
```

