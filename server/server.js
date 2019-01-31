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

// sockets
io.on('connect', (socket)=>{
  socket.emit('serverMsg',{
    name:'Server',
    text:'Server is online.'
  });
});

io.on('connection', (socket)=>{
  console.log('A Client connected');
  socket.on('message',(msg)=>{
    msg.text = 'joined the chat.'
    io.emit('serverMsg',msg);
  });
});

io.on('changedUserName', (msg)=>{
  console.log('Changed username: ',JSON.stringify(msg));
  io.emit('serverMsg',msg);
});

server.listen(port,()=>{
  console.log(`Server is up on port ${port}`);
});
