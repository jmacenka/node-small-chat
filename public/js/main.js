console.log('Started Session.');

var userName = new Date().getTime().toString(16).toUpperCase().slice(7);

document.getElementById('userName').value = userName;

var socket = io();


var getObjectById = function(id){
  return document.getElementById(id)
};

var updateDisplay = function(msg){
  var newText = `<br> ${msg.timestamp} <b><span class="${msg.name.toLowerCase()}">${msg.name}</span></b>: ${msg.text}`
  getObjectById('display').innerHTML += newText;
  document.getElementById('display').scrollTop = document.getElementById('display').scrollHeight;
};

var updateUserName = function(){
  let prevUserName = userName;
  userName = getObjectById('userName').value;
  getObjectById('console').placeholder = userName + ': Type your text here'
  socket.emit('changedUserName',{
    name:userName,
    text:prevUserName + ' changed name to ' + userName,
  });
  console.log(`The username changed to ${userName}`);
}

var sendConsole = function(){
  var msg = getObjectById('console').value;
  var sendObj = {
    name:userName,
    text:msg
  }
  console.log('Sent to server: ',sendObj);
  socket.emit('clientMessage',sendObj);
  getObjectById('console').value = '';
}

socket.on('connect', function(){
  socket.emit('message',{
    connected:true,
    name:userName,
  });
});

socket.on('serverMsg',function(msg){
  console.log('Recieved from server: ', msg);
  updateDisplay(msg);
});

document.getElementById('console').addEventListener("keyup", function(event){
  event.preventDefault();
  if (event.keyCode == 13){
    sendConsole();
  }
});
