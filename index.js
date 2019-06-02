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
    let name = conv.parameters.any;
    const query = conv.parameters['price-type'];
      axios.get('https://ac-controller-25c84.firebaseio.com/ac_power.json')
      .then( (result) => {
        console.log(result);
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
