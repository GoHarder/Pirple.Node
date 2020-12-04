/*
 * TCP (Net) Server
 */

// Node Dependencies
const net = require('net');

// Create the server
const server = net.createServer(connection => {
   // Send the reply message
   const outboundMessage = 'This is a message from the server: Pong';
   connection.write(outboundMessage);

   // When the client writes something, log it out
   connection.on('data', inboundMessage => {
      messageString = inboundMessage.toString();
      console.log(`Input: ${messageString}\nOutput: ${outboundMessage}`);
   });
});

server.listen(6000);
