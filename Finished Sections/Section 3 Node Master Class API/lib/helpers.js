/*
 * Helpers for various tasks
 */

// Node Dependencies
var crypto = require('crypto');
var querystring = require('querystring');
var https = require('https');

// Project Dependencies
var config = require('./config');

// Container for the helpers
var helpers = {};

// Create a random string of alphanumeric characters
helpers.createRandomString = (strLength)=>{
   strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
   if (strLength) {

      // Define allowed characters in the string
      var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

      // Start the string
      var str = '';

      for (i = 1; i <= strLength; i++) {
         
         // Get random character from possible characters
         var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
         // Append the string
         str += randomCharacter;
      }
      return str;
   } else {
      return false;
   }
};

// Create a SHA256 hash
helpers.hash = (str)=>{
   if (typeof(str) == 'string' && str.length > 0) {
      var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
      return hash;
   } else {
      return false;
   }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str)=>{
   try {
      var obj = JSON.parse(str);
      return obj;
   } catch (err) {
      return {};
   }
};

// Send an SMS via Twilio
helpers.sendTwilioSms = (phone, msg, callback)=>{

   // Validate parameters
   phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
   msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

   if (phone && msg) {
      
      // Configure the request payload
      var payload = {
         'From': config.twilio.fromPhone,
         'To': `+1${phone}`,
         'Body': msg
      };

      // Stringify the payload
      var stringPayload = querystring.stringify(payload);

      // Configure the request details
      var requestDetails = {
         'protocol': 'https:',
         'hostname': 'api.twilio.com',
         'method': 'POST',
         'path': `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
         'auth': `${config.twilio.accountSid}:${config.twilio.authToken}`,
         'headers': {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload)
         }
      };

   // Instantiate the request object
   var req = https.request(requestDetails, (res)=>{

      // Grab the status of the sent request
      var status =  res.statusCode;

      // Callback successfully if the request went through
      if (status == 200 || status == 201) {
         callback(false);
      } else {
         callback(`Status code returned: ${status}`);
      }
   });

   // Bind to the error event so it doesn't get thrown
   req.on('error',function(err){
      callback(err);
   });

   // Add the payload
   req.write(stringPayload);

   // End the request
   req.end();

   } else {
      callback('Given parameters were missing or invalid');
   }
};

// Export the module
module.exports = helpers;