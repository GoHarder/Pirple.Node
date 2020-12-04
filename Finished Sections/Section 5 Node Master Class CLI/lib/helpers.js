/*
 * Helpers for various tasks
 */

// Node Dependencies
var crypto = require('crypto');
var querystring = require('querystring');
var https = require('https');
var path = require('path');
var fs = require('fs');

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

   // Validate the parameters
   phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
   msg = typeof(msg) == 'string' && msg.trim().length <= 1600 ? msg.trim() : false;

   if (phone && msg) {
      
      // Configure the request payload
      var payload = {
         'From': config.twilio.fromPhone,
         'To' : `+1${phone}`,
         'Body' : msg
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
         var status = res.statusCode;

         // Callback if the request went through
         if (status == 200 || status == 201) {
            callback(false);
         } else {
            callback(`Return Status Code: ${res.statusCode}`);
         }
      });

      // Bind to error event so it doesn't get thrown
      req.on('error', (err)=>{
         callback(err);
      });

      // Add the payload
      req.write(stringPayload);

      // End request
      req.end();
      
   } else {
      callback('Parameters were missing or invalid')
   }
};

// Get the string content of a template
helpers.getTemplate = (templateName, data, callback)=>{
   templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
   data = typeof(data) == 'object' && data !== null ? data : {};
   if (templateName) {
      var templatesDir = path.join(__dirname, '/../templates/');
      fs.readFile(`${templatesDir}${templateName}.html`, 'utf8', (err, str)=>{
         if (!err && str && str.length > 0) {

            // Do interpolation on the string
            var finalString = helpers.interpolate(str, data);
            callback(false, finalString);
         } else {
            callback('No template could be found');
         }
      });
   } else {
      callback('A valid template name was not specified');
   }
};

// Add the universal header and footer to a string and pass the provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback)=>{
   str = typeof(str) == 'string' && str.length > 0 ? str : '';
   data = typeof(data) == 'object' && data !== null ? data : {};

   // Get the header
   helpers.getTemplate('_header', data, (err, headerString)=>{
      if (!err && headerString) {
         
         // Get the footer
         helpers.getTemplate('_footer', data, (err, footerString)=>{
            if (!err && footerString) {
               
               // Add the strings together
               var fullString = `${headerString}${str}${footerString}`
               callback(false, fullString);
            } else {
               callback('Could not find footer template');
            }
         });
      } else {
         callback('Could not find header template');
      }
   });
};

// Take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data)=>{
   str = typeof(str) == 'string' && str.length > 0 ? str : '';
   data = typeof(data) == 'object' && data !== null ? data : {};

   // Add the template globals to the data object, pre-pending their key name with their value
   for (var keyName in config.templateGlobals) {
      if (config.templateGlobals.hasOwnProperty(keyName)) {
         data[`global.${keyName}`] = config.templateGlobals[keyName];
      }
   }

   // For each key in the data object, insert its value its sting at the placeholder
   for (var key in data) {
      if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
         var replace = data[key];
         var find = `{${key}}`;
         str = str.replace(find, replace);
      }
   }
   return str;
};

// Get the content of a static asset
helpers.getStaticAsset = (fileName, callback)=>{
   fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
   if (fileName) {
      var publicDir = path.join(__dirname, '/../public/');
      fs.readFile(`${publicDir}${fileName}`, (err, data)=>{
         if (!err && data) {
            callback(false, data);
         } else {
            callback('No file could be found');
         }
      });
   } else {
      callback('A valid file name was not specified');
   }
};

// Export the module
module.exports = helpers;