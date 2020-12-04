/*
 * UDP Datagram Client
 */

// Node Dependencies
const dgram = require('dgram');

// Project Dependencies

// Create client
const client = dgram.createSocket('udp4');

// Define the massage and pull it into a buffer
const messageString = 'This is a message from the client';
const messageBuffer = Buffer.from(messageString);

// Send off the message
client.send(messageBuffer, 6000, 'localhost', err => {
   client.close();
});
