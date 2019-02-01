// imports
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

// static stuff
const staticDir = path.join(__dirname,'..','public')
let port = process.env.PORT || 3000;

// variable stuff
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(staticDir));

var emitServerMsg = function(msg){
  msg.timestamp = new Date().toTimeString().split(' ')[0];
  io.emit('serverMsg', msg);
};

// sockets
io.on('connect', (socket)=>{
  emitServerMsg({
    name:'Server',
    text:'Established connection to server.'
  });
});

io.on('connection', (socket)=>{
  console.log('A Client connected');
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
