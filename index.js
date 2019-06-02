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
            axios.patch('https://ac-controller-25c84.firebaseio.com/.json',{"ac_power": ac_power}
            )
            .then(function (response) {
              resolve("Air Conditioner turned "+ac);
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

assistant.intent('power_device', conv => {

  return new Promise((resolve, reject) => {
    let device = conv.parameters.power_status;
      if(device == "on"){
        device_power = true;
      }
      else{
       device_power = false;
      }
      axios.get('https://ac-controller-25c84.firebaseio.com/device_power.json')
      .then( (result) => {
        console.log(result.data);
        let device_power_prev = result.data;
         if(device_power == device_power_prev){
          resolve("Device is already " + device);
         }
         else{
            axios.patch('https://ac-controller-25c84.firebaseio.com/.json',{"device_power": device_power}
            )
            .then(function (response) {
              resolve("Device turned "+device);
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
