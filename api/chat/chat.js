window.addEventListener("load", function(){
	

    askNotification()
    getChatData('room1');
    
//    ws.addEventListener('connection', function open() {
//        console.log("woop");
//    });
//		
//	ws.addEventListener('message', function(message) {
//      addMessage(JSON.parse(message.data), true);    
//    });
//	
//	ws.addEventListener("close", function(data){
//		console.log("Web Socket unexpectadly closed")
//	})
  
	test.addEventListener("change", function(){
      sendMessage();
    });
	
	userName.addEventListener("change", function(){
      userNameChange();
	});
  
  
});

const ws = new WebSocket('ws://192.168.0.19:1335/',"room1");
let colours = ["red", "blue", "greeen", "pink", "orange"];
let userColour = {}

function addMessage(data, notifi) {
  
  //let messageData = message;

  let cssClass = "otherMessage";
  let colour = "";
  let commentor = data['user'];

  if(userName.value == commentor){
      cssClass = "myMessage";
  }else{
    if(userColour[commentor]){
        colour = userColour[commentor];

    }
    else{
        colour = colours[Math.floor(Math.random()*colours.length)]
        userColour[commentor] = colour;
    }
    if (notifi === true && Notification.permission === "granted") {
      // If it's okay let's create a notification
      let notification = new Notification(`${data['user']} : \n  ${data['data']}`);
    }
  }

  if(data.user && data.user.length > 25){
    data.user = data.user.substring(0, 25) + "..."
  }

  let className = !data['user'] ? "anon" : data['user'];
  className = className.replace(/\s/g, '');

  if(data.data && typeof data.data == "string" && data.data.includes(".gif")){
    //Add a gif to the chat
    let newDiv = document.createElement("div")
    let divText = document.createTextNode(`${data['user']} : \n`)
    let newImg = document.createElement("img")
    newImg.setAttribute('src', data['data']);
    newImg.setAttribute('alt', data['user']);
    newDiv.appendChild(divText);
    newDiv.appendChild(newImg);
    newDiv.style.backgroundColor = colour;
    newDiv.classList.add(cssClass, "message", className)

    document.getElementById("testMessage").appendChild(newDiv)

  }
  else{
    //Add a normal text element to the chat
    let newDiv = document.createElement("div")
    let divText = document.createTextNode(`${data['user']} : \n  ${data['data']}`)
    newDiv.appendChild(divText);
    newDiv.style.backgroundColor = colour;
    newDiv.classList.add(cssClass, "message", className)

    document.getElementById("testMessage").appendChild(newDiv)

  }

  
  testMessage.scrollTop = testMessage.scrollHeight;
}

function sendMessage() {
  if(test.value.trim() != ""){
    try{
      ws.send(JSON.stringify({message : test.value,
               room : "room1", user: userName.value, type: "chat"}),function ack(e){
                  alert("hi");
                  console.log("sfafjkjhkan");
                  console.log(error);
      });
      test.value = "";
    
    }catch(e){
        console.log("fuck");
    }
  }
}

function userNameChange() {
  //Remove all messages curently marked as the userers
  const elementsToRemove = document.querySelectorAll(".myMessage");
  for(element of elementsToRemove){
      element.classList.remove("myMessage");
      element.className += " otherMessage";
  }

  // Assign all new users messages
  const className = "." + userName.value.replace(/\s/g, '');
  const elementsToUpdate = document.querySelectorAll(className);
  for(element of elementsToUpdate){
      element.removeAttribute("style")
      element.classList.remove("otherMessage");
      element.className += " myMessage";
  }
}

function askNotification() {
  Notification.requestPermission(function (permission) {
    // If the user accepts, let's create a notification
    //console.log("boop")
    if (permission === "granted") {
      //var notification = new Notification("Hi there!");
    }
    else{
      console.error(permission)
    }
  });
}

function getChatData(room){
//  fetch(`chat/${room}`, { method: 'GET', 'content-type': 'application/json'})
//    .then((res) => res.json())
//    .then((data) => {
//        data.reverse()
        data = [{user: "rob", data: "Message 1"}, {user: "rob", data: "Message 2"}, {user: "Sam", data: "Message 3"}]
        data.forEach((message) =>{
          //console.log(data);
          addMessage(message);
        })
//  })
}
