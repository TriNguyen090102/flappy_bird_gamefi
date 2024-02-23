"use strict";
module.exports = function (app) {
  var api = require("../controller/APIcontroller");
  app.get('/api/getTicketBalance', api.getTicketBalance);
  app.get('/api/getBalance', api.getBalance);
  app.get('/api/startMatch', api.startMatch);
  app.get('/api/getAllActiveMatches', api.getAllActiveMatches);
  app.get('/api/getAllMatches', api.getAllMatches);
  app.post('/api/deposit', api.deposit);
  app.post('/api/withdraw', api.withdraw);
  app.post('/api/endMatch', api.endMatch);
  app.post('/api/addPlayer', api.addNewPlayer);
};
