console.log('Started Session.');

// Initialize username and chatroom if set to default
var displayUsername = document.getElementById('userName')
if (displayUsername.value === '_default'){
  displayUsername.value = 'User' + new Date().getTime().toString(10).slice(9);
};
var userName = displayUsername.value;

var displayChatRoom = document.getElementById('chatRoom')
if (displayChatRoom.value === '_default'){
  displayChatRoom.value = 'public';
}
var chatRoom = document.getElementById('chatRoom').value

// variable stuff
var socket = io();
var currentOnline = 1;

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
    currentOnline = msg.clientsOnline;
    updateChatRoomDisplay();
    document.getElementById('display').scrollTop = document.getElementById('display').scrollHeight;
  } else {
    return;
  };
};

var updateChatRoomDisplay = function(){
  chatNumber = `<i>Only you are online. You are in the chatroom ${chatRoom}.</i>`
  if (currentOnline > 1){
    chatNumber = `<i>${currentOnline} people are online. You are in the chatroom ${chatRoom}.</i>`;
  }
  getObjectById('clientsOnline').innerHTML = chatNumber;
};

var updateUserName = function(){
  let prevUserName = userName;
  userName = getObjectById('userName').value;
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
    text:`entered the chatroom ${chatRoom}.`
  });
  updateChatRoomDisplay();
};

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

socket.on('disconnect',function(){
  console.log('List connection to server');
  updateDisplay({
    name:'Server',
    text:'Lost connection to server.',
    timestamp:new Date().toTimeString().split(' ')[0]
  });
});

socket.on('changedChatRoom',function(msg){
  console.log('someone left the chatroom');
  if (msg.prevChatRoom === chatRoom){
    console.log('and we knew him');
    updateDisplay({name:'Server',text:`%{msg.name} left the chatroom.`});
  };
});
