/*
 * Request handlers
 */

// Project Dependencies
var _data = require('./data');
var helpers = require('./classHelpers');
var config = require('./config');

// Define the handlers
var handlers = {};

// Users handler
handlers.users = (data, callback)=>{
   var acceptableMethods = ['post', 'put', 'get', 'delete'];
   if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._users[data.method](data, callback);
   } else {
      callback(405);
   }
};

// Container for the users sub methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = (data, callback)=>{

   // Check that all required fields are filled out
   var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
   var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
   var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

   if (firstName && lastName && phone && password && tosAgreement) {
      
      // Make sure user doesn't already exist
      _data.read('users', phone, (err, data)=>{
         if (err) {

            // Hash the password
            var hashedPassword = helpers.hash(password);

            // Create the user object
            if (hashedPassword){
               var userObject = {
                  'firstName': firstName,
                  'lastName': lastName,
                  'phone': phone,
                  'hashedPassword': hashedPassword,
                  'tosAgreement': true
               };

               // Store the user
               _data.create('users', phone, userObject, (err)=>{
                  if (!err) {
                     callback(200);
                  } else {
                     console.log(err);
                     callback(500, {'Error': 'Could not create the new user'});
                  }
               });
            } else {
               callback(500, {'Error': 'Could not hash the user password'});
            }
         } else {

            // User already exists
            callback(400, {'Error': "A user with that number already exists"});
         }
      });
   } else {
      callback(400, {'Error': "Missing required fields"});
   }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback)=>{
   var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
   if (phone) {

      // Get the token from the headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
         if (tokenIsValid) {
            
            // Lookup the user
            _data.read('users', phone, (err, data)=>{
               if (!err && data) {

                  // Removed hashed password from user object before returning it
                  delete data.hashedPassword;
                  callback(200, data);
               } else {
                  callback(404);
               }
            });
         } else {
            callback(403, {'Error': 'Token is not valid or token is missing'});
         }
      });
   } else {
      callback(400, {'Error': 'Missing required fields'});
   }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password, tosAgreement (one must be specified)
handlers._users.put = (data, callback)=>{

   // Check for required data
   var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

   // Check for optional data
   var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
   var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
   var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

   if (phone) {
      // Error is nothing is sent to update
      if (firstName || lastName || password) {

         // Get the token from the headers
         var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

         // Verify that the given token is valid for the phone number
         handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
            if (tokenIsValid) {

            // Look up user
            _data.read('users', phone, (err, readData)=>{
               if (!err && data) {
      
                  // Update related updated fields
                  if (firstName) {
                     readData.firstName = firstName;
                  }
                  if (lastName) {
                     readData.lastName = lastName;
                  }
                  if (password) {

                     // Hash the password
                     var hashedPassword = helpers.hash(password);
                     if (hashedPassword){
                        readData.password = hashedPassword;
                     } else {
                        callback(500, {'Error': 'Could not hash the user password'});
                     }                  
                  }

                  // Store updates
                  _data.update('users', phone, readData, (err)=>{
                     if (!err) {
                        callback(200);
                     } else {
                        console.log(err);
                        callback(500, {'Error': 'Could not update user'});
                     }
                  });

               } else {
                  callback(400, {'Error': 'User does not exist'});
               }
            });
            } else {
               callback(403, {'Error': 'Token is not valid or token is missing'});
            }
         });
      } else {
         callback(400, {'Error': 'Missing required fields to update'});
      }
   } else {
      callback(400, {'Error': 'Missing required field'});
   }
};

// Users - delete
// Required data: phone
handlers._users.delete = (data, callback)=>{
   // Check is phone is valid
   var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
   if (phone) {

      // Get the token from the headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
         if (tokenIsValid) {

            // Look up the user
            _data.read('users', phone, (err, data)=>{
               if (!err && data) {

                  // Delete the user
                  _data.delete('users', phone, (err)=>{
                     if (!err) {

                        // Delete the checks that the user had
                        var userChecks = typeof(data.checks) == 'object' && data.checks instanceof Array ? data.checks : [];
                        var checksToDelete = userChecks.length;
                        if (checksToDelete > 0) {
                           var checksDeleted = 0;
                           var deletionErrors = false;
                           
                           // Loop through the checks
                           userChecks.forEach((checkId)=>{
                              
                              // Delete the check
                              _data.delete('checks', checkId, (err)=>{
                                 if (err) {
                                    deletionErrors = true;
                                 }
                                 checksDeleted++;
                                 if (checksDeleted == checksToDelete) {
                                    if (!deletionErrors) {
                                       callback(200);
                                    } else {
                                       callback(500, {'Error': 'Error in deleting checks'})
                                    }         
                                 }
                              })
                           });
                        } else {
                           callback(200);
                        }
                     } else {
                        callback(500, {'Error': 'Could not delete the user'});
                     }
                  });
               } else {
                  callback(400, {'Error': 'Could not find the specified user'});
               }
            });
         } else {
            callback(403, {'Error': 'Token is not valid or token is missing'});
         }
      });
   } else {
      callback(400, {'Error': 'Missing required fields'});
   }
};

// Tokens handler
handlers.tokens = (data, callback)=>{
   var acceptableMethods = ['post', 'put', 'get', 'delete'];
   if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._tokens[data.method](data, callback);
   } else {
      callback(405);
   }
};

// Container for the users sub methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback)=>{

   // Check that all required fields are filled out
   var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
   var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

   if (phone && password) {
      
      // Look up user who matches that phone number
      _data.read('users', phone, (err, readData)=>{
         if (!err && readData) {

            // Hash the password compare it to stored password
            var hashedPassword = helpers.hash(password);

            if (hashedPassword == readData.hashedPassword) {

               // If valid create a new token with a random name that expires 1 hour in the future
               var tokenId = helpers.createRandomString(20);
               var expires = Date.now() + 1000 * 60 * 60;

               var tokenObject = {
                  'phone': phone,
                  'id': tokenId,
                  'expires': expires,
               };

               // Store the token
               _data.create('tokens', tokenId, tokenObject, (err)=>{
                  if (!err) {
                     callback(200, tokenObject);
                  } else {
                     console.log(err);
                     callback(500, {'Error': 'Could not create new token'});
                  }
               });
            } else {
               callback(400, {'Error': "Password did not match user's password"});
            }
         } else {
            callback(400, {'Error': "Could not find user"});
         }
      });
   } else {
      callback(400, {'Error': "Missing required fields"});
   }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback)=>{
   var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
   if (id) {

      // Lookup the token
      _data.read('tokens', id, (err, data)=>{
         if (!err && data) {
            callback(200, data);
         } else {
            callback(404);
         }
      });
   } else {
      callback(400, {'Error': 'Missing required fields'});
   }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback)=>{

   // Check for required data
   var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
   var extend = typeof(data.payload.extend) == 'boolean' ? true : false;

   if (id && extend) {

      // Look up token
      _data.read('tokens', id, (err, readData)=>{
         if (!err && readData) {

            // Check to see if the token has expired
            if (readData.expires > Date.now()) {
               
               // Update related updated fields
               readData.expires = Date.now() + 1000 * 60 * 60;

               // Store updates
               _data.update('tokens', id, readData, (err)=>{
                  if (!err) {
                     callback(200);
                  } else {
                     console.log(err);
                     callback(500, {'Error': 'Could not update token'});
                  }
               });
            } else {
               callback(400, {'Error': 'Token has expired'});
            }
         } else {
            callback(400, {'Error': 'Token does not exist'});
         }
      });
   } else {
      callback(400, {'Error': 'Missing required field'});
   }
};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback)=>{
   // Check if id is valid
   var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
   if (id) {

      // Look up the token
      _data.read('tokens', id, (err, data)=>{
         if (!err && data) {

            // Delete the token
            _data.delete('tokens', id, (err)=>{
               if (!err) {
                  callback(200);
               } else {
                  callback(500, {'Error': 'Could not delete the token'});
               }
            });
         } else {
            callback(400, {'Error': 'Could not find the specified token'});
         }
      });

   } else {
      callback(400, {'Error': 'Missing required fields'});
   }
};

// Verify if a given token id is currently valid for a give user
handlers._tokens.verifyToken = (id, phone, callback)=>{
   // Look up the token

   _data.read('tokens', id, (err, readData)=>{
      if (!err && readData) {
         
         // Check that the token is for the given user and has not expired
         if (phone == readData.phone && readData.expires > Date.now()) {
            callback(true);
         } else {
            callback(false);
         }
      } else {
         callback(false);
      }
   });
};

// Checks handler
handlers.checks = (data, callback)=>{
   var acceptableMethods = ['post', 'put', 'get', 'delete'];
   if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._checks[data.method](data, callback);
   } else {
      callback(405);
   }
};

// Container for the users sub methods
handlers._checks = {};

// Checks - post
// Required data: protocol, url, method, success, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback)=>{

   // Validate inputs
   var protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
   var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
   var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', "delete"].indexOf(data.payload.method) > -1 ? data.payload.method : false;
   var success = typeof(data.payload.success) == 'object' && data.payload.success instanceof Array && data.payload.success.length > 0 ? data.payload.success : false;
   var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

   if (protocol && url && method && success && timeoutSeconds) {
      
      // Get the token from the headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Look up user by reading token
      _data.read('tokens', token, (err, tokenData)=>{
         if (!err && tokenData) {
            var userPhone = tokenData.phone;

            // Look up user data
            _data.read('users', userPhone, (err, userData)=>{
               if (!err && userData) {
                  var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                  // Verify that the user has less than the number of maxChecks
                  if (userChecks.length < config.maxChecks ) {
                     
                     // Create random id for the check
                     var checkId = helpers.createRandomString(20);

                     // Create the check object and include the users phone
                     var checkObject = {
                        'id': checkId,
                        'userPhone': userPhone,
                        'protocol': protocol,
                        'url': url,
                        'method': method,
                        'success': success,
                        'timeoutSeconds': timeoutSeconds
                     };

                     // Save the object
                     _data.create('checks', checkId, checkObject, (err)=>{
                        if (!err) {
                           
                           // Add the check Id to the users object
                           userData.checks = userChecks;
                           userData.checks.push(checkId);

                           // Save the new user data
                           _data.update('users', userPhone, userData, (err)=>{
                              if (!err) {
                                 
                                 // Return the data about the new check
                                 callback(200, checkObject);
                              } else {
                                 callback(500, {'Error': 'Could not update the user with the new check'});
                              }
                           }); 
                        } else {
                           callback(500, {'Error': 'Could not create the new check'});
                        }
                     });
                  } else {
                     callback(400, {'Error': `The user has the maximum number of checks (${config.maxChecks})`});
                  }
               } else {
                  callback(403);
               }
            });
         } else {
            callback(403);
         }
      });
   } else {
      callback(400, {'Error': "Missing required inputs or inputs are invalid"});
   }
};

// Checks - get
// Required data: id
// Optional data: none
handlers._checks.get = (data, callback)=>{
   var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
   if (id) {

      // Lookup the check
      _data.read('checks', id, (err, checkData)=>{
         if (!err && checkData) {

            // Get the token from the headers
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // Verify that the given token is valid for user who made the check
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid)=>{
               if (tokenIsValid) {
                  callback(200, checkData);
               } else {
                  callback(403, {'Error': 'Token is not valid or token is missing'});
               }
            });
         } else {
            callback(404);
         }
      });
   } else {
      callback(400, {'Error': 'Missing required fields'});
   }
};

// Checks - put
// Required data: id
// Optional data: protocol, url, method, success, timeoutSeconds
handlers._checks.put = (data, callback)=>{

   // Check for required data
   var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

   // Check for optional data
   var protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
   var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
   var method = typeof(data.payload.method) == 'string' && ['post', 'get', 'put', "delete"].indexOf(data.payload.method) > -1 ? data.payload.method : false;
   var success = typeof(data.payload.success) == 'object' && data.payload.success instanceof Array && data.payload.success.length > 0 ? data.payload.success : false;
   var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

   if (id) {
      // Error is nothing is sent to update
      if (protocol || url || method || success || timeoutSeconds) {

         // Get the token from the headers
         var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // Look up user
            _data.read('checks', id, (err, readData)=>{
               if (!err && data) {
      
               // Verify that the given token is valid for the id
               handlers._tokens.verifyToken(token, readData.userPhone, (tokenIsValid)=>{
                  if (tokenIsValid) {

                     // Update related updated fields
                     if (protocol) {
                        readData.protocol = protocol;
                     }
                     if (url) {
                        readData.url = url;
                     }
                     if (method) {
                        readData.method = method;
                     }
                     if (success) {
                        readData.success = success;
                     }
                     if (timeoutSeconds) {
                        readData.timeoutSeconds = timeoutSeconds;
                     }
   
                     // Store updates
                     _data.update('checks', id, readData, (err)=>{
                        if (!err) {
                           callback(200);
                        } else {
                           console.log(err);
                           callback(500, {'Error': 'Could not update check'});
                        }
                     });
                  } else {
                     callback(403, {'Error': 'Token is not valid or token is missing'});
                  }
               });
               } else {
                  callback(400, {'Error': 'Check does not exist'});
               }
            });
      } else {
         callback(400, {'Error': 'Missing required fields to update'});
      }
   } else {
      callback(400, {'Error': 'Missing required field'});
   }
};

// Checks = delete
// Required data: id
// Optional data: none
handlers._checks.delete = (data, callback)=>{

   // Check for required data
   var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

   if (id) {
      
      // Get the token from the headers
      var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

      // Look up check
      _data.read('checks', id, (err, checkData)=>{
         if (!err && checkData) {

            // Verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid)=>{
               if (tokenIsValid) {

                  // Delete the check
                  _data.delete('checks', id, (err)=>{
                     if (!err) {
            
                        // Look up the user
                        _data.read('users', checkData.userPhone, (err, userData)=>{
                           if (!err && userData) {      
                              var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                              // Remote check from list of checks
                              var checkPosition = userChecks.indexOf(id);
                              if (checkPosition > -1) {
                                 userChecks.splice(checkPosition, 1);

                                 // Re-save the data
                                 _data.update('users', checkData.userPhone, userData, (err)=>{
                                    if (!err) {
                                       callback(200);
                                    } else {
                                       callback(500, {'Error': 'Could not update user'});
                                    }
                                 });
                              } else {
                                 callback(500, {'Error': 'Could not find the check on the object'});
                              }  
                           } else {
                              callback(400, {'Error': 'Could not find the specified user'});
                           }
                        });
                     } else {
                        callback(500, {'Error': 'Could not delete the check'});
                     }
                  });
               } else {
                  callback(403, {'Error': 'Token is not valid or token is missing'});
               }
            });
         } else {
            callback(400, {'Error': 'Check does not exist'});
         }
      });
   } else {
      callback(400, {'Error': 'Missing required field'});
   }
};

// Ping handler
handlers.ping = (data, callback)=>{
   callback(200);
};

// Not found handler
handlers.notFound = (data, callback)=>{
   callback(404);
};

// Export the module
module.exports = handlers;