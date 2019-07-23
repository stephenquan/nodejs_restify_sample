#!/usr/bin/nodejs

let Restify = require("restify");
let Request = require("request");
let Shell = require("shelljs");
let Fs = require("fs");
let Os = require("os");

//----------------------------------------------------------------------

let config = {
  server: {
    name: "Node.JS starter server",
    port: 6080
  },
  bodyParser: {
    mapParams: true,
    uploadDir: Os.tmpdir() + "/nodejs_upload_dir"
  },
  queryParser: {
    mapParams: true,
  },
};

//----------------------------------------------------------------------

var server;

//----------------------------------------------------------------------

function createServer() {
  if ( ! Fs.existsSync( config.bodyParser.uploadDir ) ) {
    Fs.mkdirSync( config.bodyParser.uploadDir );
  }
  server = Restify.createServer( config.server );
  server.use( Restify.plugins.queryParser() );
  server.use( Restify.plugins.jsonp() );
  server.use( Restify.plugins.bodyParser( config.bodyParser ) )
  server.use( Restify.plugins.queryParser( config.queryParser ) )
  server.get( "/:_service", serviceApi );
  server.post( "/:_service", serviceApi );
  server.put( "/:_service", serviceApi );
  server.head( "/:_service", serviceApi );
  server.del( "/:_service", serviceApi );
  server.listen( config.server.port, function() {
    console.log( "server.name:", server.name );
    console.log( "server.url:", server.url );
    console.log();
  } );
}

//----------------------------------------------------------------------

function serviceApi( request, response, next ) {
  console.log();
  console.log( "serviceApi: request.params: ", JSON.stringify(request.params) );

  let service = request.params._service;

  if (!service) {
    return versionApi( request, response, next );
  }

  switch (service) {
  case "version": return versionApi( request, response, next );
  case "info": return infoApi( request, response, next );
  case "echo": return echoApi( request, response, next );
  case "uptime": return uptimeApi( request, response, next );
  case "counter": return counterApi( request, response, next );
  case "arcgis": return arcgisApi( request, response, next );
  }

  return versionApi( request, response, next );
}

//----------------------------------------------------------------------

function versionApi( request, response, next ) {
  console.log( "versionApi: request.params: ", JSON.stringify(request.params) );
  sendResponse( request, response, next, { version: "1.0.0" } );
}

//----------------------------------------------------------------------

function infoApi( request, response, next ) {
  console.log( "infoApi: request.params: ", JSON.stringify(request.params) );
  let data = {
    arch: Os.arch(),
    numcpus: Os.cpus().length,
    endianness: Os.endianness(),
    freemem: Os.freemem(),
    homedir: Os.homedir(),
    hostname: Os.hostname(),
    platform: Os.platform(),
    release: Os.release(),
    tmpdir: Os.tmpdir(),
    totalmem: Os.totalmem(),
    addresses: Object.values(Os.networkInterfaces()).map( i => i[0].address ),
    type: Os.type(),
    uptime: Os.uptime(),
  };
  sendResponse( request, response, next, data );
}

//----------------------------------------------------------------------

function echoApi( request, response, next ) {
  console.log( "echoApi: request.params: ", JSON.stringify(request.params) );
  let data = {
    method: request.method,
    url: request.url,
    path: request._url.pathname,
    params: request.params,
  };
  if ( request.files ) {
    data.files = Object.entries( request.files ).reduce( (p, [a, v] ) => ( p[a] = v, p), { } );
  }
  sendResponse( request, response, next, data );
}

//----------------------------------------------------------------------

function uptimeApi( request, response, next ) {
  console.log( "uptimeApi: request.params:", JSON.stringify(request.params) );
  ( async function() {
    let { code, stdout, stderr } = await shellExecWithPromise( "uptime" );
    sendResponse( request, response, next, { code, stdout, stderr } );
  } )();
}

//----------------------------------------------------------------------

function counterApi( request, response, next ) {
  console.log( "counterApi: request.params:", JSON.stringify(request.params) );
  ( async function() {
    let data = { counter: 0 };
    try {
      let txt = await readFileWithPromise( "/tmp/counter.js" );
      data = JSON.parse( txt );
    } catch (err) {
      Error.captureStackTrace( err );
      console.log( "Caught Error: ", err.message );
      console.log( "Stack: ", err.stack );
    }
    let result = { counter: data.counter + 1 };
    try {
      await writeFileWithPromise( "/tmp/counter.js", JSON.stringify( result ) );
    } catch (err) {
      Error.captureStackTrace( err );
      console.log( "Caught Error: ", err.message );
      console.log( "Stack: ", err.stack );
    }
    sendResponse( request, response, next, result );
  } )();
}

//----------------------------------------------------------------------

function arcgisApi( request, response, next ) {
  console.log( "arcgisApi: request.params:", JSON.stringify(request.params) );
  ( async function() {
    let { resp, body } = await requestWithPromise( "https://www.arcgis.com/sharing/rest/info?f=json" );
    try {
      body = JSON.parse( body );
    } catch (err) {
      Error.captureStackTrace( err );
      console.log( "Caught Error: ", err.message );
      console.log( "Stack: ", err.stack );
    }
    sendResponse( request, response, next, { resp, body } );
  } )();
}

//----------------------------------------------------------------------

function shellExecWithPromise( command ) {
  return new Promise( (resolve, reject) => {
    Shell.exec( command, ( code, stdout, stderr ) => {
      resolve( { code, stdout, stderr } );
    } );
  } );
}

//----------------------------------------------------------------------

function readFileWithPromise( path ) {
  return new Promise( (resolve, reject) => {
    Fs.readFile( path, ( err, data ) => {
      if ( err ) {
        reject( err );
        return;
      }
      resolve( data );
    } )
  } );
}

//----------------------------------------------------------------------

function writeFileWithPromise( path, data ) {
  return new Promise( (resolve, reject) => {
    Fs.writeFile( path, data, ( err ) => {
      if ( err ) {
        reject( err );
        return;
      }
      resolve();
    } )
  } );
}

//----------------------------------------------------------------------

function requestWithPromise( url ) {
  return new Promise( (resolve, reject) => {
    Request( url, ( err, resp, body ) => {
      if ( err ) {
        reject( err );
        return;
      }
      resolve( {
        resp: {
          httpVersion: resp.httpVersion,
          headers: resp.headers,
          statusCode: resp.statusCode,
          statusMessage: resp.statusMessage
        },
        body: body
      } );
    } );
  } );
}

//----------------------------------------------------------------------

function sendResponse( request, response, next, data, dataType, statusCode ) {
  console.log( "sendResponse: ", JSON.stringify( { data, dataType, statusCode } ) );

  if ( !statusCode ) {
    statusCode = 200;
  }

  if (request.params.callback) {
    response.send( data );
    next();
    return;
  }

  if (data instanceof Object) {
    data = JSON.stringify(data, undefined, 2) + "\n";
    dataType = "text/plain";
  }

  if (typeof data === "string") {
    if ( !dataType ) {
      dataType = "text/plain";
    }

    let headers = {
      "Content-Length": Buffer.byteLength(data),
      "Content-Type": dataType
    };

    response.writeHead( statusCode, headers );
    response.write( data );
    response.end();
    next();
    return;
  }

  response.send(data);
  next();
}

//----------------------------------------------------------------------

createServer();

