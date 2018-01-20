

window.addEventListener("load", function() { 
    
  
//  fetch(`poll/12345`, { method: 'GET', 'content-type': 'application/json'})
//    .then((res) => res.json())
//    .then((data) => {
       let questions = []
       let data = {}
       data.questions = ['One', 'Two', 'Three']
       data.answers = [{answer: "bt0"}, {answer: "bt0"},{answer: "bt0"}, {answer: "bt1"}, {answer: "bt1"}, {answer: "bt2"}]
       data.title = "Test Poll"
      data.questions.forEach((question) =>{
         questions.push(question);
       })
    
      pollTitle.innerText = data.title;
      initPoll(questions, data.answers)

      data.answers.forEach((result) =>{
        pollHandler(result.answer);
      });

//    })
  
//    ws.addEventListener('connection', function open() {
//        console.log("woop");
//    });
//
//	ws.addEventListener("close", function(data){
//		console.log("Web Socket unexpectadly closed")
//	})
//  ws.addEventListener('message', function(message) {
//    //console.log(message)
//    const messageData = JSON.parse(message.data);
//    messageData.forEach((data) =>{
//      console.log(data.user, data.message)
//      pollHandler(data.user, parseInt(data.message));
//    });
//
//  });
  
});
//const ws = new WebSocket('ws://192.168.0.19:1334/12345',"poll");


function pollHandler(elemId, votes) {
  votes = votes == null ? 1 : votes; 
  //find the number of the button pressed
  const buttonNumber = elemId.split("bt")[1]
  // Get related poll element
  const barToEnhance = document.getElementById("q" + buttonNumber);

  //Get number from current width
  const currentWidth = parseInt(barToEnhance.style.width.split("em")[0]);
 // Generate new width
  const newWidth = currentWidth + votes;
  //set new width of bar
  barToEnhance.style.width = newWidth + "em";

}


function initPoll(questions, answers){

  questions.forEach((question, i) =>{

    const pollBar = `<div id="q${i}" class="poll" style="width: 1em;">${question}</div>`;
    const button = `<div id="bt${i}" class="button">${question}</div>`;

    buttons.innerHTML +=  button;
    pollContainer.innerHTML += pollBar;
  });
  
    //find all buttons on page
  const optionButtons = document.querySelectorAll(".button");

  optionButtons.forEach((elem) => {

    elem.addEventListener("click", () => {
      console.log("click")
       // pollHandler(elem.id);
      //ws.send(JSON.stringify({ type: "poll", vote: elem.id, pollId: "12345", user : user.value}), ()=> console.log); 
      fetch(`poll/12345`, { method: 'PUT', 'content-type': 'application/json', body: JSON.stringify({ type: "poll", vote: elem.id, pollId: "12345", user: user.value})})
    });
  });
}

