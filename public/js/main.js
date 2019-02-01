console.log('Started Session.');

// Generate a dynamic username and update the display
var userName = 'User' + new Date().getTime().toString(10).slice(9);
document.getElementById('userName').value = userName;

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
  var newText = `<br> ${msg.timestamp} <b><span class="${msg.name.toLowerCase()}">${msg.name}</span></b>: ${msg.text}`
  getObjectById('display').innerHTML += newText;
  chatNumber = 'Only you are currently in this chatroom.'
  if (msg.clientsOnline > 1){
    chatNumber = `${msg.clientsOnline} people are in this chatroom`;
  }
  getObjectById('clientsOnline').innerHTML = chatNumber;
  document.getElementById('display').scrollTop = document.getElementById('display').scrollHeight;
};

var updateUserName = function(){
  let prevUserName = userName;
  userName = getObjectById('userName').value;
  getObjectById('console').placeholder = userName + ':'
  socket.emit('changedUserName',{
    name:userName,
    oldName:prevUserName,
    text:'<i>' + prevUserName + '</i> changed name to <i>' + userName +'</i>',
  });
  console.log(`The username changed to ${userName}`);
}

var sendConsole = function(){
  var msg = getObjectById('console').value;
  if (!msg.length > 0) return;
  var sendObj = {
    name:userName,
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
  });
});

socket.on('serverMsg',function(msg){
  console.log('Recieved from server: ', msg);
  updateDisplay(msg);
});
