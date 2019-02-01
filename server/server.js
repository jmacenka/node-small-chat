// imports
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

// static stuff
const staticDir = path.join(__dirname,'..','public')
let port = process.env.PORT || 3000;

// variable stuff
var clientsOnline = 0;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(staticDir));

// utility functions
var emitServerMsg = function(msg){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  io.emit('serverMsg', msg);
};

var privateServerMsg = function(socket, msg){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  socket.emit('serverMsg', msg);
};

var broadcastServerMsg = function(socket, msg, reply){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  reply.timestamp = msg.timestamp;
  socket.broadcast.emit('serverMsg', msg);
  reply.name = 'Server';
  reply.text = reply.text || '';
  socket.emit('serverMsg', reply);
};

// socket handling
io.on('connection', (socket)=>{
  var userNameServer = '';
  var userNameClient = '';
  clientsOnline += 1;
  socket.on('conAck',(msg)=>{
    userNameServer = msg.name;
    userNameClient = msg.name;
    console.log(userNameServer,' connected. Total online: ', clientsOnline);
    msg.text = 'joined the chat.'
    broadcastServerMsg(socket, msg, {text:'Welcome ' + msg.name});
  });

  socket.on('disconnect',()=>{
    clientsOnline -= 1;
    console.log(userNameServer, ' left the chat. Total online: ',clientsOnline);
    emitServerMsg({
      name:userNameClient,
      text:'left the chat.',
    });
  });

  socket.on('clientMessage', (msg)=>{
    emitServerMsg(msg);
  });

  socket.on('changedUserName', (msg)=>{
    userNameClient = msg.name;
    broadcastServerMsg(socket, msg, {text:'changed your chat name to '+msg.name, name:'Server'});
  });

});

// start the server
server.listen(port,()=>{
  console.log(`Server is up on port ${port}`);
});
