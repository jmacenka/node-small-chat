console.log('Started Session.');

// Generate a dynamic username and update the display
var userName = 'User' + new Date().getTime().toString(10).slice(9);
document.getElementById('userName').value = userName;

// initialize a chatroom to be changed by the user
var chatRoom = document.getElementById('chatRoom').value

// variable stuff
var socket = io();

document.getElementById('console').addEventListener("keyup", function(event){
  event.preventDefault();
  if (event.keyCode == 13){
    sendConsole();
  }
});

// utility functions
var getObjectById = function(id){
  return document.getElementById(id)
};

var updateDisplay = function(msg){
  console.log(`Updating Display msg chatroom = ${msg.chatRoom} / client chatroom = ${chatRoom}`);
  if (msg.chatRoom === chatRoom || msg.name === 'Server'){
    var newText = `<br> ${msg.timestamp} <b><span class="${msg.name.toLowerCase()}">${msg.name}</span></b>: ${msg.text}`
    getObjectById('display').innerHTML += newText;
    chatNumber = 'Only you are currently in this chatroom.'
    if (msg.clientsOnline > 1){
      chatNumber = `${msg.clientsOnline} people are in this chatroom`;
    }
    getObjectById('clientsOnline').innerHTML = chatNumber;
    document.getElementById('display').scrollTop = document.getElementById('display').scrollHeight;
  } else {
    return;
  };
};

var updateUserName = function(){
  let prevUserName = userName;
  userName = getObjectById('userName').value;
  getObjectById('console').placeholder = userName + ':'
  socket.emit('changedUserName',{
    name:userName,
    chatRoom:chatRoom,
    oldName:prevUserName,
    text:'<i>' + prevUserName + '</i> changed name to <i>' + userName +'</i>',
  });
  console.log(`The username changed to ${userName}`);
}

var updateChatRoom = function(){
  let prevChatRoom = chatRoom;
  chatRoom = getObjectById('chatRoom').value;
  console.log('New Chatroom: ', chatRoom);
  socket.emit('changedChatRoom',{
    name:userName,
    chatRoom:chatRoom,
    prevChatRoom:prevChatRoom,
    text:`changed from ${prevChatRoom} to ${chatRoom}`
  });
}

var sendConsole = function(){
  var msg = getObjectById('console').value;
  if (!msg.length > 0) return;
  var sendObj = {
    name:userName,
    chatRoom:chatRoom,
    text:msg
  }
  console.log('Sent to server: ',sendObj);
  socket.emit('clientMessage',sendObj);
  getObjectById('console').value = '';
}

// socket handling
socket.on('connect', function(){
  socket.emit('conAck',{
    connected:true,
    name:userName,
    chatRoom:chatRoom
  });
});

socket.on('serverMsg',function(msg){
  console.log('Recieved from server: ', msg);
  updateDisplay(msg);
});
