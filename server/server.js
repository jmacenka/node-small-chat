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

var emitServerMsg = function(msg){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  io.emit('serverMsg', msg);
};

var privateServerMsg = function(socket, msg){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  socket.emit('serverMsg', msg);
};

// sockets
io.on('connect', (socket)=>{
  privateServerMsg(socket,{
    name:'Server',
    text:'Established connection to server'
  });
});

io.on('disconect', (socket)=>{ // TODO: Close Event funktioniert noch nicht richtig.
  clientsOnline -= 1;
  console.log('A Client connected. Total online: ', clientsOnline);
});

io.on('connection', (socket)=>{
  clientsOnline += 1;
  console.log('A Client connected. Total online: ', clientsOnline);
  socket.on('message',(msg)=>{
    msg.text = 'joined the chat.'
    emitServerMsg(msg);
  });

  socket.on('clientMessage', (msg)=>{
    emitServerMsg(msg);
  });

  socket.on('changedUserName', (msg)=>{
    emitServerMsg(msg);
  });

});

io.on('changedUserName', (msg)=>{
  console.log('Changed username: ',JSON.stringify(msg));
  emitServerMsg(msg);
});

server.listen(port,()=>{
  console.log(`Server is up on port ${port}`);
});
