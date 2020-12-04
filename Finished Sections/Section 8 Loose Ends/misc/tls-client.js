/*
 * TLS / SSL Client (Like Net client but with ssl)
 */

// Node Dependencies
const tls = require('tls');
// If certificate is self signed then this needs to be included
const fs = require('fs');
const path = require('path');

// Server options
const options = {
   ca: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
// Include ^

// Define the message to send
const outboundMessage = 'This is a message from the client: Ping';

// Create the client
const client = tls.connect(6000, options, () => {
   // Send the message
   client.write(outboundMessage);
});

// When the server responds log what it says and kill client
client.on('data', inboundMessage => {
   const messageString = inboundMessage.toString();
   console.log('\x1b[32m%s\x1b[0m', `Input: ${messageString}\nOutput: ${outboundMessage}`);
   client.end();
});
