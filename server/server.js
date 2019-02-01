// imports
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

// static stuff
const staticDir = path.join(__dirname,'..','public')
let port = process.env.PORT || 3000;

// variable stuff
var visitorCounter = 0;
var clientsOnline = 0;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(staticDir));

// utility functions
var getTimestamp = function(){
  return new Date().toTimeString().split(' ')[0];
};

var emitServerMsg = function(msg){
  msg.timestamp = getTimestamp();
  msg.clientsOnline = clientsOnline;
  io.emit('serverMsg', msg);
};

var privateServerMsg = function(socket, msg){
  msg.timestamp = getTimestamp();
  msg.clientsOnline = clientsOnline;
  socket.emit('serverMsg', msg);
};

var broadcastServerMsg = function(socket, msg, reply){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  reply.timestamp = msg.timestamp;
  msg.clientsOnline = clientsOnline;
  reply.clientsOnline = clientsOnline;
  socket.broadcast.emit('serverMsg', msg);
  reply.name = 'Server';
  reply.text = reply.text || '';
  socket.emit('serverMsg', reply);
};

// socket handling
io.on('connection', (socket)=>{
  var userNameServer = '';
  var userNameClient = '';
  var chatRoomClient = '';

  clientsOnline += 1;
  visitorCounter += 1;

  socket.on('conAck',(msg)=>{
    userNameServer = msg.name;
    userNameClient = msg.name;
    console.log(`${getTimestamp()}: ${userNameServer} connected. Online: ${clientsOnline}. Total visitors ${visitorCounter}.`);
    msg.text = 'came online.'
    broadcastServerMsg(socket, msg, {text:'Welcome ' + msg.name});
  });

  socket.on('disconnect',()=>{
    clientsOnline -= 1;
    console.log(`${getTimestamp()}: ${userNameServer} disconnected. Online: ${clientsOnline}.`);
    emitServerMsg({
      name:userNameClient,
      text:'left the chat.',
      chatRoom:chatRoomClient,
    });
  });

  socket.on('clientMessage', (msg)=>{
    console.log(`${getTimestamp()}: ${msg.name} wrote "${msg.text}"`);
    emitServerMsg(msg);
  });

  socket.on('changedUserName', (msg)=>{
    console.log(`${getTimestamp()}: ${msg.oldName} changed name to ${msg.name}.`);
    userNameClient = msg.name;
    broadcastServerMsg(socket, msg, {text:'changed your chat name to '+msg.name, name:'Server'});
  });

  socket.on('changedChatRoom', (msg)=>{
    console.log(`${getTimestamp()}: ${msg.name} changed chatroom to ${msg.chatRoom}.`);
    chatRoomClient = msg.chatRoom;
    broadcastServerMsg(socket, msg, {text:'you entered the chatroom '+msg.chatRoom, name:'Server'});
  });

});

// start the server
server.listen(port,()=>{
  console.log(`${getTimestamp()}: Server is up on port ${port}`);
});
