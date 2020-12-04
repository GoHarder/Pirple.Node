/*
 * TCP (Net) Client
 */

// Node Dependencies
const net = require('net');

// Define the message to send
const outboundMessage = 'This is a message from the client: Ping';

// Create the client
const client = net.createConnection({ port: 6000 }, () => {
   // Send the message
   client.write(outboundMessage);
});

// When the server responds log what it says and kill client
client.on('data', inboundMessage => {
   const messageString = inboundMessage.toString();
   console.log('\x1b[32m%s\x1b[0m', `Input: ${messageString}\nOutput: ${outboundMessage}`);
   client.end();
});
