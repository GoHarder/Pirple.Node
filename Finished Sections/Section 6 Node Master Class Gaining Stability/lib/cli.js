/*
 * Primary file for the API
 */

// Node Dependencies
const readline = require('readline');
const util = require('util');
const events = require('events');
const os = require('os');
const v8 = require('v8');
const debug = util.debuglog('cli');

// Node extends
class _events extends events{};

// Node instances
const event = new _events();

// Project Dependencies
const _data = require('./data');
const _logs = require('./logs');
const helpers = require('./helpers');

// Declare the cli
var cli = {};

// Input handlers
event.on('man', ()=>{
   cli.responders.help();
});

event.on('help', ()=>{
   cli.responders.help();
});

event.on('exit', ()=>{
   cli.responders.exit();
});

event.on('stats', ()=>{
   cli.responders.stats();
});

event.on('list users', ()=>{
   cli.responders.listUsers();
});

event.on('more user info', str =>{
   cli.responders.moreUserInfo(str);
});

event.on('list checks', str =>{
   cli.responders.listChecks(str);
});

event.on('more check info', str =>{
   cli.responders.moreCheckInfo(str);
});

event.on('list logs', ()=>{
   cli.responders.listLogs();
});

event.on('more log info', (str)=>{
   cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};

// Create a horizontal line
cli.horizontalLine = ()=>{

   // Get the available space
   const width = process.stdout.columns - 1;
   let line = '';
   for (let i = 0; i < width; i++) {
     line += '-';
   }
   console.log(line);
};

// Create centered text on the screen
cli.centered = str =>{
   str = typeof(str) && str.trim().length > 0 ? str.trim() : '';

   // Get the available space
   const width = process.stdout.columns;

   // Calculate the left padding
   const leftPadding = Math.floor((width - str.length) / 2);

   // Put in left padded spaces
   let line = '';
   for (let i = 0; i < leftPadding; i++) {
      line += ' ';
   }

   line += str;
   console.log(line);
};

// Create a vertical space
cli.verticalSpace = lines =>{
   lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
   for (let i = 0; i < lines; i++) {
      console.log('');
   }
};

// Help Man
cli.responders.help = ()=>{
   const commands = {
      'exit': 'Exit the CLI',
      'man': 'Show help page',
      'help': 'Alias of the "man" command',
      'stats': 'Get statistics on the underlying operating system and resource utilization ',
      'list users': 'Show a list of all the users in the system',
      'more user info --{userId}': 'Show details of a specific user',
      'list checks --up --down': 'Show a list of all the active checks in the system. The "--up" and "--down" flags are optional',
      'more check info --{checkId}': 'Show details of a specific check',
      'list logs': 'Show a list of all the log files available to be read',
      'more log info --{fileName}': 'Show details of a specific log file'
   };

   // Show a header for the help page that is as wide as the screen
   cli.horizontalLine();
   cli.centered('CLI MANUAL');
   cli.horizontalLine();
   cli.verticalSpace();

   // Show each command, followed by an explanation, in yellow in white
   for (const key in commands) {
      if (commands.hasOwnProperty(key)) {
         const value = commands[key];
         let line = `\x1b[33m${key}\x1b[0m`;
         const padding = 60 - line.length;

         for (let i = 0; i < padding; i++) {
           line += ' ';
         }

         line += value;
         console.log(line);
      }
   }

   // End with another horizontal line
   cli.verticalSpace();
   cli.horizontalLine();
   cli.verticalSpace();
};

// Exit
cli.responders.exit = ()=>{
   process.exit(0);
};

// Stats
cli.responders.stats = ()=>{
   
   // Compile an object of stats
   var stats = {
      'Load Average': os.loadavg().join(' '),
      'CPU Count': os.cpus().length,
      'Free Memory': `${os.freemem()} bytes`,
      'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
      'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
      'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
      'Allocated Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
      'Uptime': `${os.uptime()} Seconds`
   };

   // Show a header for the help page that is as wide as the screen
   cli.horizontalLine();
   cli.centered('SYSTEM STATISTICS');
   cli.horizontalLine();
   cli.verticalSpace();

   // Show each command, followed by an explanation, in yellow in white
   for (const key in stats) {
      if (stats.hasOwnProperty(key)) {
         const value = stats[key];
         let line = `\x1b[33m${key}\x1b[0m`;
         const padding = 60 - line.length;

         for (let i = 0; i < padding; i++) {
           line += ' ';
         }

         line += value;
         console.log(line);
      }
   }

   // End with another horizontal line
   cli.verticalSpace();
   cli.horizontalLine();
   cli.verticalSpace();
};

// List Users
cli.responders.listUsers = ()=>{
   _data.list('users', (err, userIds)=>{
      if (!err && userIds && userIds.length > 0) {
         userIds.forEach(userId => {
            _data.read('users', userId, (err, userData)=>{
               if (!err && userData) {
                  let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: `;
                  let numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
                  line += numberOfChecks;
                  console.log(line);
               }
            })
         });
         cli.verticalSpace();
      }
   });
};

// More User Info
cli.responders.moreUserInfo = (str)=>{

   // Get the IF from the string
   let arr = str.split('--');
   let userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

   if (userId) {

      // Look the user up
      _data.read('users', userId, (err, userData)=>{
         if (!err, userData) {
            
            // Remove the hashed password
            delete userData.hashedPassword;

            // Print the JSON with text highlighting
            cli.verticalSpace();
            console.dir(userData, {'colors': true});
         }
      })
   }
};

// List Checks
cli.responders.listChecks = str =>{
   _data.list('checks', (err, checkIds)=>{
      if (!err && checkIds && checkIds.length > 0) {
         cli.verticalSpace();
         checkIds.forEach(checkId =>{
            _data.read('checks', checkId, (err, checkData)=>{
               if (!err && checkData) {
                  let lowerString = str.toLowerCase();

                  // Get the state, default to down
                  let state = typeof(checkData.state) == 'string' ? checkData.state : 'down';

                  // Get the state default, default to unknown
                  let stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';

                  // If the user has specified the state, or hasn't include the current check
                  if (lowerString.indexOf(`--${state}`) > -1 || lowerString.indexOf(`--down`) == -1 && lowerString.indexOf(`--up`) == -1) {
                     let line = `ID: ${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} State: ${stateOrUnknown}`;
                     console.log(line);
                     cli.verticalSpace();
                  }
               }
            });
         });
      }
   });
};

// More Check Info
cli.responders.moreCheckInfo = (str)=>{
   
   // Get the IF from the string
   let arr = str.split('--');
   let checkId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

   if (checkId) {

      // Look the user up
      _data.read('checks', checkId, (err, checkData)=>{
         if (!err, checkData) {

            // Print the JSON with text highlighting
            cli.verticalSpace();
            console.dir(checkData, {'colors': true});
         }
      })
   }
};

// List Logs
cli.responders.listLogs = ()=>{
   _logs.list(true, (err, logFileNames)=>{
      if (!err && logFileNames && logFileNames.length > 0) {
         cli.verticalSpace();
         logFileNames.forEach(logFileName =>{
            if (logFileName.indexOf('-') > -1) {
               console.log(logFileName);
               cli.verticalSpace(1);
            }
         });
      }
   });
};

// More Log Info
cli.responders.moreLogInfo = str => {

   // Get the IF from the string
   let arr = str.split('--');
   let logFileName = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
   if (logFileName) {
      cli.verticalSpace();

      // Decompress the log file
      _logs.decompress(logFileName, (err, logData)=>{
         if (!err && logData) {
            
            // Split into lines
            const arr = logData.split('\n');
            arr.forEach(jsonString =>{
               const logObject = helpers.parseJsonToObject(jsonString);
               if (logObject && JSON.stringify(logObject) !== '{}') {
                  console.dir(logObject, {'colors': true});
                  cli.verticalSpace();
               }
            });
         }
      });
   }
};

// Input processor
cli.processInput = (str)=>{
   str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

   // Only process the input if the user wrote something
   if (str) {
      
      // Codify the unique strings that will get responded to
      var uniqueInputs = [
         'man', 'help',
         'exit', 'stats',
         'list users',
         'more user info',
         'list checks',
         'more check info',
         'list logs',
         'more log info'
      ];

      // Go through inputs and emit an event on a match
      var matchFound = false;
      uniqueInputs.some((input)=>{
         if (str.toLowerCase().indexOf(input) > -1) {
            matchFound = true;

            // Emit event matching the input and include string
            event.emit(input, str);
            return true;
         }
      });

      // No match is found tell user to try again
      if (!matchFound) {
         console.log('\x1b[31m%s\x1b[0m', 'Invalid command');
      }
   }
};

// Init function
cli.init = ()=>{

   // Send the start message to the console
   console.log('\x1b[34m%s\x1b[0m', 'The CLI is running');

   // Start the interface
   var _interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: ''
   });

   // Create the initial prompt
   _interface.prompt();

   // Handle each line of input separately
   _interface.on('line', str =>{

      // Send to the input processor
      cli.processInput(str);

      // Bring the prompt back
      _interface.prompt();
   });

   // If the user stops the CLI, kill everything
   _interface.on('close', ()=>{
      process.exit(0);
   });
};

// Export the module
module.exports = cli;