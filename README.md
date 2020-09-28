# To Install 
```
npm install
```

# To Run 
```
npm start
```

# To Test 
```
npm run test
```
To run a subset of tests...
```
npm run test-util
npm run test-endpoints
npm run test-database
npm run test-microservices
npm run test-authentication
```

# To Start In-Memory Server 
```
var Server = require('./server.js');
var port = MY_PORT_NUMBER;
var serverConfig = require('./MY_SERVER_CONFIG.json');
var server = new Server().init(port, serverConfig);
```
# To Set The Port 
The port used by the server defaults to 3000. You can override this by setting the
NODE_SERVER_PORT environment variable to the desired port. When using the node server as
an in-memory server, just pass the desired port number.

The port can also be set in the server's config file. Doing this will override the default port
as well as the NODE_SERVER_PORT environment variable. See the Config File section for more
information.

# Config File
The config file is how you control the operation of the server. Config files are JSON files
that you place in the /src/config directory. If there are multiple config files, node server
will merge their values together into a single config structure. Only logging values are 
not merged, the first logging config encountered is used, all others are ignored.

## Port
The port used by the node server can be set in the config file. This overrides both the
default port of 3000 and the port set in the NODE_SERVER_PORT environment variable. An example 
is shown below.

```
  "port": 1337,
```

## HTTPS
The server can be set to use/not use https by setting the https config parameter to true/false.

```
  "https": true,
```

## Login Expire Time
By default, logins will expire after 5 minutes (300 seconds) of inactivity. This default can 
be overriden by setting loginExpire to the desired number of seconds. An example is shown below.

```
  "loginExpire": 600,
```

## Logging
The node server uses standard log4js logging. You configure logging
by adding standard log4js configuration to the server's config file in 
the <b>logging</b> section. An example is shown below.

```
  "logging": {
    "appenders": {
      "out": { "type": "stdout" },
      "app": { "type": "file", "filename": "application.log" }
    },
    "categories": {
      "default":
      {
        "appenders": ["out", "app"],
        "level" : "debug"
      }
    }
  },
```
See [log4js-node](https://log4js-node.github.io/log4js-node/) for details on the log4js configuration.

## Statics
Provides configuration information for static services.
Static services send data from files back to the client.
### Fields
* **verb**<br/>
Example: "POST"<br/>
The HTTP verb. Optional. Defaults to GET.
* **path**<br/>
Example: "/json"<br/>
The URL path that invokes the static.
* **response**<br/>
Example: "./server-config.json"<br/>
The location of the response file.
An array of response file paths can also be used. The server will cycle
through the array, advancing with each request.<br/>
A parameter token can be added to the end of the response and that token 
will be replaced with the value of the query parameter with the same
name.<br>
Example: "./:id"<br/>
The file whose name matches the value of the :id query parameter will be
returned.<br/>
* **responseType**<br/>
Example: "JSON"<br/>
The type of data in the response file. Valid values
are JSON, TEXT, BLOB, and HBS (a Handlebars template file).
* **headers**<br/>
Example: [ { "header": "Access-Control-Allow-Origin", "value": "*" } ]<br/>
An array of headers that should be included in the response.
* **hbsData**<br/>
Example: {"title": "Index"}<br/>
A JSON object that should be sent to the
Handlebars template (used only for HBS type files). If an array is used
in the response field, and array of equal size should also be used in
the hbsData field.
* **authentication**<br/>
Example: "local"<br/>
Sets the authentication strategy used by this route. Optional. Usually only
one route, the one that processes logins, will need authentication.
* **authorization**<br/>
Example: "{ "strategy": "local", "groups": [ "admin" ] }"<br/>
Sets the authorization strategy used by this route and lists the groups that
can use the route. Optional. If no authorization is given, anyone can access the route.
* **logging**<br/>
Example: "all"<br/>
Sets the logging level to be used by this route. Optional. If not present, the logging
level for the server is used.

### Examples
* A static service at GET /ping. It returns a JSON object and sets a header
named MY_HEADER to MY_HEADER_VALUE.
```
  "statics": [
    {
        "path": "/ping",
        "response": {"name":"My Server","version":"1.0"},
        "responseType": "JSON",
        "headers": [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]
    }]
```

* A static service that returns JSON objects read from files. There are
multiple files. They will be returned one after the other on multiple
requests.
```
  "statics": [
    {
        "path": "/json-string-array",
        "response": ["./server-config.json", "./test/test-data.json"],
        "responseType": "JSON",
    }]
```

* A static service that sends a JSON object as a response. A Handlebars
form, index.hbs, is used to display the data. Handlebars forms are in
the views directory.
```
  "statics": [
    {
        "path": "/hbs",
        "response": "index.hbs",
        "responseType": "HBS",
        "hbsData": {"title": "Index"},
    }]
```

* A static service that sends multiple JSON objects as a response.
Handlebars forms are used to display the data. The objects and forms
will cycle through one per request.
```
  "statics": [
    {
        "path": "/hbs-string-array",
        "response": [ "index.hbs", "error.hbs" ],
        "responseType": "HBS",
        "hbsData": [ {"title": "Index"}, {"title": "Not Found"} ],
    }]
```

* A static service that returns a text file as a response.
```
  "statics": [
    {
        "path": "/text",
        "response": "./views/index.hbs",
        "responseType": "TEXT",
    }]
```

* A static service that sends multiple text files as a response, one per
request.
```
  "statics": [
    {
        "path": "/text-string-array",
        "response": [ "./views/index.hbs", "./views/error.hbs" ],
        "responseType": "TEXT",
    }]
```

* A static service that presents a file upload form to the client and
stores the uploaded file in the files directory. The hbsData field is
required and the JSON must have the title text, action URL, and HTTP
verb fields.
```
  "statics": [
    {
        "path": "/uploadfile",
        "response": "upload.hbs",
        "responseType": "HBS",
        "hbsData": {"title": "Upload File", "action": "upload", "verb": "POST"}
    }]
```

## Microservices
Provides simple services that should take only a few seconds to execute. A microservice
is allocated a certain amount of time to execute. If it does not complete before this time,
execution is halted and a 408 error is returned. The amount of time allowed defaults to
20000 miliseconds (20 seconds). Use the time parameter of the microservice's config to adjust
the timeout.

Microservices are stateless and have no lifecycle. A new microservice object
will be instantiated every time a request to the microservice is made.

Microservices have a do(reqInfo) method that returns a promise. The resolve()
and reject() methods of the promise will be passed a Microservice Result Object.

The promise is fulfilled when the microservice completes a request.

### ReqInfo
The reqInfo object passed into the microservice has the following members:
```
{
    serviceInfo:    Object.     Information about this service (JSON).
    body:           Object.     The body of the request that invoked this microservice.
    params:         Array.      The params of the request that invoked this microservice.
    query:          Array.      The query values of the request that invoked this microservice.
    files:          Array.      The files of the request that invoked this microservice.
    headers:        Array.      The headers of the request that invoked this microservice.
    cookies:        Array.      The cookies of the request that invoked this microservice.
    pipe:           Object.     Request pipe.
    busboy:         Object.     Busboy object.
    clientIp        String.     IP of the client making the request.
}
```
### Microservice Result Object
Resolve and request functions are passed a microservice result object, which has the following
members:
```
    status:             Number.             The HTTP status of the operation.
    send:               String or String[]  Strings that should be written to the response.
    fileDownloadPath:   String              A file that should be downloaded in the response.
    fileDeleteAfterDownload:     Boolean    Should the file be deleted after download.
    viewName:           String              The name of a view to send as the response.
    viewObject:         JSON                An object used to render the view.
```
Send, fileDownloadPath, and viewName/viewObject are mutually exclusive. You can use only one
of these three methods of sending data in the response per response. The only exception to this
is on reject, in which case the server will always check the send field for an error message to
log, even if fileDownloadPath or viewName/viewObject are used.

### Config Fields
* **verb**<br/>
Example: "POST"<br/>
The HTTP verb. Optional. Defaults to GET.
* **path**<br/>
Example: "/throw"<br/>
The URL path that invokes the microservice.
* **name**<br/>
Example: "Throw Exception"<br/>
The human-readable name of the microservice.
* **description**<br/>
Example: "A micro service that throws an exception. For testing purposes."<br/>
A short human-readable description of the microservice.<br/>
* **serviceFile**<br/>
Example: "/throw.js"<br/>
The name of the javascript file containing the
microservice. These names are relative to the microservices directory.
* **timeout**<br/>
The number of miliseconds the microservice is allowed to execute. If not provided,
this value defaults to 20000 (20 seconds).
* **serviceData**<br/>
Example: "serviceData": { "level": "DEBUG", "json": true, }<br/>
An optional
field that provides a JSON object for use by the micro service. Currently, only
the log-request microservice uses this field. It has the following options:
level The logging level used to write to the log. Can be ALL, TRACE, DEBUG, INFO, WARN,
ERROR, or FATAL.
json: True if the data being written is JSON.
* **headers**<br/>
Example: [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]<br/>
An optional array of headers that should be included in the response.
* **cookies**<br/>
Example: [ 
    { "name": "MY_COOKIE1", "value": "MY_COOKIE_VALUE1" },  
    { "name": "MY_COOKIE2", "value": "MY_COOKIE_VALUE2", "expires": 9999 },  
    { "name": "MY_COOKIE3", "value": "MY_COOKIE_VALUE3", "maxAge" : 9999 }
    ]<br/>
An optional array of cookies that should be included in the response.
* **authentication**<br/>
Example: "local"<br/>
Sets the authentication strategy used by this route. Optional. Usually only
one route, the one that processes logins, will need authentication.
* **authorization**<br/>
Example: "{ "strategy": "local", "groups": [ "admin" ] }"<br/>
Sets the authorization strategy used by this route and lists the groups that
can use the route. Optional. If no authorization is given, anyone can access the route.
* **logging**<br/>
Example: "all"<br/>
Sets the logging level to be used by this route. Optional. If not present, the logging
level for the server is used.

### Examples
 * A microservice service at GET /download/:name that downloads the file
 :name from the files directory. The microservices/download.js file
 contains the code for the service.
```
    "microservices": [{
        "path": "/download/:name",
        "name": "File Download",
        "description": "Downloads a file from the files directory of the server. The :name Parameter is the file name.",
        "serviceFile": "download.js",
        "timeout": 10000
    }]
```

## Endpoints
Endpoints are traditional route handlers that accept an HTTP request and Response
object and a next function. The lifetime of an endpoint object matches the lifetime
of the server it's running in. To give you an idea of how to write one, a sample
end point is provided below.
```
let Registry = require('../util/registry');
let ServiceBase = require ( '../util/service-base.js' );

class Stop extends ServiceBase {
    Stop(configInfo) {
        this.configInfo = configInfo;
    }
    do (req, res, next) {
        this.addHeaders(this.configInfo, res);
        this.addCookies(this.configInfo, res);
        let server = Registry.get('Server');
        if (!server || !server.stop) {
            let jsonResponse = JSON.stringify({status: 'Error stopping server'});
            res.status(500);
            res.send(jsonResponse);
            next();
        }
        let jsonResponse = JSON.stringify({status: 'Stopping server'});
        res.status(200);
        res.send(jsonResponse);
        server.stop();
    }
}
``` 
### Config Fields
* **verb**<br/>
Example: "POST"<br/>
The HTTP verb. Optional. Defaults to GET.
* **path**<br/>
Example: "/stop"<br/>
The URL path that invokes the endpoint.
* **name**<br/>
Example: "Stop"<br/>
The human-readable name of the endpoint.
* **description**<br/>
Example: "Stops the server."<br/>
A short human-readable description of the endpoint.<br/>
* **serviceFile**<br/>
Example: "stop.js"<br/>
The name of the javascript file containing the
endpoint. These names are relative to the endpoints directory.
* **headers**<br/>
Example: [ { "header": "MY_HEADER", "value": "MY_HEADER_VALUE" } ]<br/>
An optional array of headers that should be included in the response.
* **cookies**<br/>
Example: [ 
    { "name": "MY_COOKIE1", "value": "MY_COOKIE_VALUE1" },  
    { "name": "MY_COOKIE2", "value": "MY_COOKIE_VALUE2", "expires": 9999 },  
    { "name": "MY_COOKIE3", "value": "MY_COOKIE_VALUE3", "maxAge" : 9999 }
    ]<br/>
An optional array of cookies that should be included in the response.

## DatabaseConnections
Database connections are used to work with databases. All database
connections listed in the server config file will be automatically
connected to their respective databases.

Use the DatabaseConnectionManager to disconnect all database connections
or to obtain an individual database connection object by name.

Each database connection object has methods to connect, disconnect, and
ping that connection.
### Fields
* **name**<br/>
Example: "elasticsearch"<br/>
The name given to a connection.A database can have multiple connections,
each with a unique name.
* **type**<br/>
Example: "elasticsearch"<br/>
The type of database connection. Valid values are 'eleasticsearch' and 'mongo'.
* **description"**<br/>
Example: "Elasticsearch service."<br/>
A short human-readable description of the database connection.
* **databaseConnector**<br/>
Example: "elasticsearch-database-connector.js"<br/>
The name of the javascript file containing the database connection
class. These names are relative to the database-connectors directory.
* **config**<br/>
Example: { "host": "localhost:9200", "log": "trace" }<br/>
A JSON object that will be passed to the database connector class. It
contains any information needed to configure the connection. It is up to
the database connector class to interpret this data. This field is
ignored when the connector is set up to use a backend database server
using the backendURL parameter.
* **authentication**<br/>
Example: "local"<br/>
Sets the authentication strategy used by this route. Optional. Usually only
one route, the one that processes logins, will need authentication.
* **authorization**<br/>
Example: "{ "strategy": "local", "groups": [ "admin" ] }"<br/>
Sets the authorization strategy used by this route and lists the groups that
can use the route. Optional. If no authorization is given, anyone can access the route.
* **logging**<br/>
Example: "all"<br/>
Sets the logging level to be used by this route. Optional. If not present, the logging
level for the server is used.
### Examples
 * A simple config for Elasticsearch.
```
  "databaseConnections" : [
    {
      "name": "elasticsearch",
      "type": "elasticsearch",
      "description": "Elasticsearch service.",
      "databaseConnector": "elasticsearch.js",
      "config": {
        "host": "localhost:9200",
        "log": "trace"
      }
    }]
```
 * A simple config for Mongo.
```
  "databaseConnections" : [
    {
      "name": "mongo",
      "type": "mongo",
      "description": "Mongo service.",
      "databaseConnector": "elasticsearch.js",
      "config": {
        "url": 'mongodb://localhost:27017',
        "db": 'testdb',
        "collections": {
            "testCollection": { w: 0 }
        }
      }
    }]
``` 
* A simple config for GitHub.
```
  "databaseConnections" : [
    {
      "name": "github",
      "type": "github",
      "description": "Github service.",
      "databaseConnector": "githubdb.js",
      "factory": "github-factory.js",
      "config": {
        "owner": "me",
        "repo": "my-github-db",
        "committer": { "name": "me", "email": "me@gmail.com" },
        "author": { "name": "me", "email": "me@gmail.com" }
      }
    }]
```

## Registry
The registry stores name/value pairs that are available to the entire program.
By default, the following values are stored in the Registry:

* Server - The Server object. Of interest are its stop() method and its express
(often referred to as app) and server members.
* Port - The port the server is running on.
* ServerConfig - The JSON document that was used to configure the server.
* ServerStartTime - The time the server was started as a javascript Date object.
* DatabaseConnectionManager - The DatabaseConnectionManager used by the server.
* Passport - The Passport object used by the server.
* Accounts - The user account information used by the server.
* Headers - Authentication headers added to all responses of an authenticated user.
* Cookies - Authentication cookies added to all responses of an authenticated user.
* Crypto - A JSON object containing the key and iv buffers to use with encryption.

## Authentication
Authentiation is the process of identifying who a user is. It is a distinct process 
that is related to, but seperate from, authoriation, which determines what a user is 
allowed to do.

Passport is integrated into the server. A local strategy which uses a JSON file of 
account information is configured out of the box. You are never required to use the 
local strategy. Additional passport strategies, such as Facebook or Google login, can 
be configured as needed.

### Local Authentication 
The local authentication strategy that's built in to the server uses a JSON file
located at private/users/authentication.json to store account informaton. A
sample is shown below (Notice that passwords are encrypted. This is done by the
/usr/add route, discussed later):

```
{
   "accounts": [
      {
         "username": "admin",
         "password": "2a7d9a2ece07736802dd18721d01d752",
         "groups": [
            "admin"
         ]
      },
      {
         "username": "username",
         "password": "6ae535f16325d62349eeaa53d1c259f6",
         "groups": [
            "user"
         ],
         "headers": [
            {
               "header": "Access-Control-Allow-Origin",
               "value": "*"
            }
         ],
         "cookies": [
            {
               "name": "MY_COOKIE1",
               "value": "MY_COOKIE_VALUE1"
            },
            {
               "name": "MY_COOKIE2",
               "value": "MY_COOKIE_VALUE2",
               "expires": 9999
            },
            {
               "name": "MY_COOKIE3",
               "value": "MY_COOKIE_VALUE3",
               "maxAge": 9999
            }
         ]
      }
   ]
}
```
Successful authentication results in an Authorization header being sent to the client.
This header must be included by the client in all requests sent to the server that 
require an authorization check.
 
The Authorization header expires after 5 minutes, at which point the client will need 
to authenticate again.

#### Fields
* **username**<br/>
Example: "admin"<br/>
The user name for the account.
* **password**<br/>
Example: "passw0rd"<br/>
The password for the account.
* **groups**<br/>
Example: "admin"<br/>
A list of groups the user belongs to. Authoriation uses groups to determine what 
actions a user is allowed to perform.
* **headers**<br/>
Example: "[{ "header": "Access-Control-Allow-Origin", "value": "*" }]"<br/>
A list of headers that will be added to responses to the users requests.
* **cookies**<br/>
Example: "[{ "name": "MY_COOKIE1", "value": "MY_COOKIE_VALUE1" }]"<br/>
A list of cookies that will be added to responses to the users requests.

#### Login
The serve comes configured with a simple login screen that can be used in conjuction with
Authentican and Authorization. The screen can be accessed using the /login route from a
browser.

### Add User
The server comes configured with an add user screen that adds users to the system. A user
must have a user name, a password, and belong to at least one group. Up to three groups
can be specified. Up to three custom headers and cookies that are sent with each response to
the user can also be specified.

The screen can be accessed using the /user/add route from a browser.

### Adding Authentication
Authentication can be added to statics, microservices, endpoints, and database connections
using the server's config file. See the sections on statics, microservices, endpoints, and
databases for examples.

If you do not configure authentication on a static, microservice, endpoint, or database 
in the server config file, the user will not have to authenticate to use that service.

## Authorization
Once a user has authenticated and their identity is known to the serve, that identity is
used to determine what actions the user is authorized to perform.

Authorization information can be added to statics, microservices, endpoints, and database
 connections using the server's config file. An example is shown below.
 
 ```
"databaseConnections" : [
     {
       "name": "elasticsearch",
       "description": "Elasticsearch service.",
       "databaseConnector": "elasticsearch.js",
       "config": {
         "host": "localhost:9200",
         "log": "trace"
       },
       "authorization": { "strategy": "local", "groups": [ "admin" ] }
     }
```

If you do not configure authorization on a static, microservice, endpoint, or database 
in the server config file, the user will not have to check for authorization to use 
that service.
#### Fields
* **strategy**<br/>
Example: "local"<br/>
The Passport strategy used to perform authorization.
* **groups**<br/>
Example: "admin"<br/>
A list of groups allowed to perform the associated operation.

