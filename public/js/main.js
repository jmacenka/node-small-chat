console.log('Does work');

var socket = io();

var getObjectById = function(id){
  return document.getElementById(id)
};

var updateDisplay = function(msg){
  var newText = `<br> <span class="${msg.name.toLowerCase()}">${msg.name}</span>: ${msg.text}`
  getObjectById('display').innerHTML += newText;
};

var updateUserName = function(){
  var userName = getObjectById('userName').value;
  socket.emit('changedUserName',{
    name:userName,
    text:'changed his name.'
  });
  console.log(`The username changed to ${userName}`);
}

var sendConsole = function(){
  var msg = getObjectById('console').value;
  console.log('Sending message: ',msg);
  getObjectById('console').value = '';
}

socket.on('connect', function(){
  socket.emit('message',{
    connected:true,
    name:'newUser',
  });
});

socket.on('serverMsg',function(msg){
  console.log(`Recieved from server: ${JSON.stringify(msg)}`);
  updateDisplay(msg);
});
