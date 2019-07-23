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

## API: Version

Example:

```bash
$ curl http://localhost:6080/version
{
  "version": "1.0.0"
}
```

## API: Info

Example:

```bash
$ curl http://localhost:6080/info
{
  "arch": "x64",
  "numcpus": 4,
  "endianness": "LE",
  "freemem": 2788184064,
  "homedir": "/home/ubuntu",
  "hostname": "ip-172-31-6-230",
  "platform": "linux",
  "release": "4.15.0-1039-aws",
  "tmpdir": "/tmp",
  "totalmem": 7834468352,
  "addresses": [
    "127.0.0.1",
    "172.31.6.230"
  ],
  "type": "Linux",
  "uptime": 1923553
}
```

## API: Echo

Examples:

```bash
$ curl 'http://localhost:6080/echo?city=melbourne&country=australia'
{
  "method": "GET",
  "url": "/echo?user=stephenquan&home=secret",
  "path": "/echo",
  "params": {
    "_service": "echo",
    "city": "melbourne",
    "country": "australia"
  }
}
$ curl -X POST http://localhost:6080/echo -F user=stephenquan -F cmd=upload -F file=@/tmp/hello.txt
{
  "method": "POST",
  "url": "/echo",
  "path": "/echo",
  "params": {
    "_service": "echo",
    "user": "stephenquan",
    "cmd": "upload"
  },
  "files": {
    "file": {
      "size": 12,
      "path": "/tmp/nodejs_upload_dir/upload_4dcf230e8e280131d1965f1ffbaf6639",
      "name": "hello.txt",
      "type": "text/plain",
      "mtime": "2019-07-23T20:51:50.966Z"
    }
  }
}
```

### API: Counter

Example:

```bash
$ curl http://localhost:6080/counter
{
  "counter": 6
}
```

### API: ArcGIS

Example:

```bash
$ curl http://localhost:6080/arcgis
{
  "resp": {
    "httpVersion": "1.1",
    "headers": {
      "date": "Tue, 23 Jul 2019 20:53:21 GMT",
      "content-type": "text/plain;charset=utf-8",
      "transfer-encoding": "chunked",
      "connection": "close",
      "vary": "Origin, Accept-Encoding",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "expires": "-1"
    },
    "statusCode": 200,
    "statusMessage": "OK"
  },
  "body": {
    "owningSystemUrl": "https://www.arcgis.com",
    "authInfo": {
      "tokenServicesUrl": "https://www.arcgis.com/sharing/rest/generateToken",
      "isTokenBasedSecurity": true
    }
  }
}
```





