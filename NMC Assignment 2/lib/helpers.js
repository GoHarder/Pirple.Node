/*
 * Helpers for various tasks
 */

// Node Dependencies
var crypto = require('crypto');
var querystring = require('querystring');
var https = require('https');
var StringDecoder = require('string_decoder').StringDecoder;

// Project Dependencies
var config = require('./config');

// Container for the helpers
var helpers = {};

// Create a random string of alphanumeric characters
helpers.createRandomString = strLength => {
   strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;
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
helpers.hash = str => {
   if (typeof str == 'string' && str.length > 0) {
      var hash = crypto
         .createHmac('sha256', config.hashingSecret)
         .update(str)
         .digest('hex');
      return hash;
   } else {
      return false;
   }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = str => {
   try {
      var obj = JSON.parse(str);
      return obj;
   } catch (err) {
      return {};
   }
};

// Send charge to stripe
helpers.sendStripeCharge = (chargeData, callback) => {
   // Validate the parameters
   var chargeData = typeof chargeData == 'object' && chargeData instanceof Object ? chargeData : false;

   var emailPattern = new RegExp(/^.+@.+$/);

   // Check charge data
   if (chargeData) {
      var email = typeof chargeData.email == 'string' && emailPattern.test(chargeData.email.trim()) ? chargeData.email.trim() : false;
      var total = typeof chargeData.total == 'number' && chargeData.total >= 5 ? chargeData.total : false;
      var cardToken = typeof chargeData.cardToken == 'string' && chargeData.cardToken.trim().length > 0 ? chargeData.cardToken.trim() : false;

      chargeData = email && total && cardToken ? chargeData : false;
   }

   if (chargeData) {
      var payload = {
         amount: total * 100,
         currency: 'usd',
         source: cardToken,
         description: `Purchase for ${email} on ${new Date()
            .toDateString()
            .split(' ')
            .slice(1)
            .join(' ')}`
      };

      // Stringify the payload
      var stringPayload = querystring.stringify(payload);

      // Configure the request details
      var requestDetails = {
         protocol: 'https:',
         hostname: 'api.stripe.com',
         method: 'POST',
         path: `/v1/charges`,
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${config.stripe.apiKey}`,
            'Content-Length': Buffer.byteLength(stringPayload)
         }
      };

      // Dummy callback to simulate the data returned for reasons
      // callback(false, { id: helpers.createRandomString(20) });

      // Instantiate the request object
      var req = https.request(requestDetails, res => {
         // Grab the status of the sent request
         var status = res.statusCode;

         // Callback if the request went through
         if (status == 200 || status == 201) {
            // Get the payload, if any
            var decoder = new StringDecoder('utf-8');
            var buffer = '';

            res.on('data', data => {
               buffer += decoder.write(data);
            });

            res.on('end', () => {
               buffer += decoder.end();
               buffer = JSON.parse(buffer);
               callback(false, buffer);
            });
         } else {
            callback(`Return Status Code: ${res.statusCode}`);
         }
      });

      // Bind to error event so it doesn't get thrown
      req.on('error', err => {
         callback(err);
      });

      // Add the payload
      req.write(stringPayload);

      // End request
      req.end();
   } else {
      callback('Parameters were missing or invalid');
   }
};

// Send to mail gun
helpers.sendToMailGun = (msgData, callback) => {
   // Validate the parameters
   var msgData = typeof msgData == 'object' && msgData instanceof Object ? msgData : false;

   var emailPattern = new RegExp(/^.+@.+$/);

   // Check charge data
   if (msgData) {
      var email = typeof msgData.email == 'string' && emailPattern.test(msgData.email.trim()) ? msgData.email.trim() : false;
      var cart = typeof msgData.cart == 'object' && msgData.cart instanceof Array ? msgData.cart : false;

      msgData = email && cart ? msgData : false;
   }

   if (msgData) {
      var receiptHtml = createHtmlReceipt(msgData.cart);

      var payload = {
         from: `mailgun@${config.mailGun.domain}`,
         to: 'gharder@hwec.com',
         subject: `Purchase for ${email} on ${new Date()
            .toDateString()
            .split(' ')
            .slice(1)
            .join(' ')}`,
         html: receiptHtml
      };

      // Stringify the payload
      var stringPayload = querystring.stringify(payload);

      // Configure the request details
      var requestDetails = {
         protocol: 'https:',
         hostname: 'api.mailgun.net',
         method: 'POST',
         path: `/v3/${config.mailGun.domain}/messages`,
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`api:${config.mailGun.apiKey}`).toString('base64')}`,
            'Content-Length': Buffer.byteLength(stringPayload)
         }
      };

      // Dummy callback to simulate the data returned for reasons
      // callback(false, 'email sent');

      // Instantiate the request object
      var req = https.request(requestDetails, res => {
         // Grab the status of the sent request
         var status = res.statusCode;

         // Callback if the request went through
         if (status == 200 || status == 201) {
            // Get the payload, if any
            var decoder = new StringDecoder('utf-8');
            var buffer = '';

            res.on('data', data => {
               buffer += decoder.write(data);
            });

            res.on('end', () => {
               buffer += decoder.end();
               callback(false, buffer);
            });
         } else {
            callback(`Return Status Code: ${res.statusCode}`);
         }
      });

      // Bind to error event so it doesn't get thrown
      req.on('error', err => {
         callback(err);
      });

      // Add the payload
      req.write(stringPayload);

      // End request
      req.end();
   } else {
      callback('Parameters were missing or invalid');
   }
};

// Create receipt
var createHtmlReceipt = cart => {
   var retStr = '<html><head><style>body{font-family:sans-serif;}h1,table,#total{text-align:center;margin:auto;}td{padding:15px;}</style></head>';
   retStr += '<body><header><h1>Receipt</h1></header><hr><table id="cartTable"><tr><th>No.</th><th>Size</th><th>Toppings</th><th>Price</th></tr>';

   var total = 0;
   var i = 1;
   cart.forEach(item => {
      total += item.price;

      retStr += `<tr><td>No. ${i}</td>`;
      retStr += `<td>${item.size}</td><td>`;

      item.toppings.forEach(topping => {
         retStr += `<p>${topping}</p>`;
      });

      retStr += `</td><td>$${item.price}</td></tr>`;
      i++;
   });

   retStr += `</table><hr><p id="total">Total = $${total}</p></body></html>`;

   return retStr;
};

// Export the module
module.exports = helpers;
