// // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// // for Dialogflow fulfillment library docs, samples, and to report issues
// 'use strict';
 
// const functions = require('firebase-functions');
// const {WebhookClient} = require('dialogflow-fulfillment');
// const {Card, Suggestion} = require('dialogflow-fulfillment');

// const admin = require('firebase-admin');
// admin.initializeApp({
//     apiKey: "AIzaSyDHIXSFKXARneEFqzeCm5ZqrLjoVRtUPPg",
//     authDomain: "ac-controller-25c84.firebaseapp.com",
//     databaseURL: "https://ac-controller-25c84.firebaseio.com",
//     projectId: "ac-controller-25c84",
//     storageBucket: "ac-controller-25c84.appspot.com",
//     messagingSenderId: "666496730536",
//     appId: "1:666496730536:web:c343bcb678224571",
// });

// process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
// exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
//   const agent = new WebhookClient({ request, response });
//   console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
//   console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
//   function welcome(agent) {
//     agent.add(`Welcome to my agent!`);
//   }
//   function power(agent) {
//      const power_status = agent.parameters.power_status;
//      var power_val;
//      if(power_status == "on"){
//        power_val = true;
//      }
//      else{
//        power_val = false;
//      }
//      return admin.database().ref('ac-controller-25c84').transaction((info) => {
//       if(info !== null) {
//         let power_prev = info.ac_power;
//         if(power_val == power_prev){
//         	agent.add(`Air Coditioner is already ` + power_status);  
//         }
//         else{
//         	info.ac_power = power_val;  	
//         	agent.add(`Air Coditioner turned ` + power_status);
//         }
//       }
//       return info;
//     }, function(error, isSuccess) {
//       console.log('Update average age transaction success: ' + isSuccess);
//     });

//   }
//   function fallback(agent) {
//     agent.add(`I didn't understand`);
//     agent.add(`I'm sorry, can you try again?`);
//   }

//   // // Uncomment and edit to make your own intent handler
//   // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
//   // // below to get this function to be run when a Dialogflow intent is matched
//   // function yourFunctionHandler(agent) {
//   //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
//   //   agent.add(new Card({
//   //       title: `Title: this is a card title`,
//   //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
//   //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
//   //       buttonText: 'This is a button',
//   //       buttonUrl: 'https://assistant.google.com/'
//   //     })
//   //   );
//   //   agent.add(new Suggestion(`Quick Reply`));
//   //   agent.add(new Suggestion(`Suggestion`));
//   //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
//   // }

//   // // Uncomment and edit to make your own Google Assistant intent handler
//   // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
//   // // below to get this function to be run when a Dialogflow intent is matched
//   // function googleAssistantHandler(agent) {
//   //   let conv = agent.conv(); // Get Actions on Google library conv instance
//   //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
//   //   agent.add(conv); // Add Actions on Google library responses to your agent's response
//   // }
//   // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
//   // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

//   // Run the proper function handler based on the matched Dialogflow intent name
//   let intentMap = new Map();
//   intentMap.set('Default Welcome Intent', welcome);
//   intentMap.set('Default Fallback Intent', fallback);
//   intentMap.set('power_ac',power);
//   // intentMap.set('your intent name here', yourFunctionHandler);
//   // intentMap.set('your intent name here', googleAssistantHandler);
//   agent.handleRequest(intentMap);
// });
const express = require('express');
const bodyParser = require('body-parser');
const {dialogflow} = require('actions-on-google');
const {WebhookClient} = require('dialogflow-fulfillment');
const axios = require('axios');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const server = express();
const assistant = dialogflow();
const apiKey = 'AVTC17ZCU5OHSEIB'; 
const baseURL = 'https://www.alphavantage.co/query?function=';

server.set('port', process.env.PORT || 5000);
server.use(bodyParser.json({type: 'application/json'}));

assistant.intent('power_ac', conv => {

  return new Promise((resolve, reject) => {
    let ac = conv.parameters.power_status;
      if(ac == "on"){
        ac_power = true;
      }
      else{
       ac_power = false;
      }
      axios.get('https://ac-controller-25c84.firebaseio.com/ac_power.json')
      .then( (result) => {
        console.log(result.data);
        let ac_power_prev = result.data;
         if(ac_power == ac_power_prev){
          resolve("Air Conditioner is already " + ac);
         }
         else{
            axios.post('https://ac-controller-25c84.firebaseio.com/',{"ac_power": true}
            )
            .then(function (response) {
              console.log(response);
            })
            .catch(function (error) {
             console.log(error);
            });
         }
    })
    .catch((error) => {
      reject(error);
    });
  })
  .then(result => {
      conv.ask(result);
  })
  .catch(error => {
      conv.close(error);
  });
});

server.post('/webhook', assistant);

server.listen(server.get('port'), function () {
  console.log('Express server started on port', server.get('port'));
});
