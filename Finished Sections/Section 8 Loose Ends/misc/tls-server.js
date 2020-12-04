/*
 * TLS / SSL Server (Like Net server but with ssl)
 */

// Node Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
const options = {
   key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
   cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

// Create the server
const server = tls.createServer(options, connection => {
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
