#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('chatapp:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('socket.io').listen(server);
/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//Socket Code
var users ={};

const modifyUsername =()=>{
  io.sockets.emit('usernames', Object.keys( users));
}
io.sockets.on("connection", (socket)=>{
  
  socket.on('send-message', (data,callback)=>{
      var message = data;
      message.trim();
      if(message.startsWith('@')){
          var index = message.indexOf(' ');
          var name = message.substr(1,index-1);
         
          message = message.substr(index+1);
          if(index === -1){
            callback("Enter Some message");
          }
          else if(name in users){
           callback("private message sent!")
            users[name].emit('private-message', {username: socket.username, message: message})
          }
          else{
            callback('user not found!');
          }
      }
      else{
        socket.broadcast.emit('new-message', {username: socket.username, message: data});
        socket.emit("my-message",{username : 'me', message:data } );
      }
        
  })

  socket.on('new-user', function(data,callback){
    if(data in users) callback(false);
    else{
      callback(true);
      socket.username = data;
      users[data] = socket;
    modifyUsername();
    }
  });
  socket.on('disconnect', function(data){
      if(!socket.username)return;
      delete users[socket.username];
      modifyUsername();
  })
})





/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
