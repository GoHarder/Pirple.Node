/*
 * Example REPL
 */

// Node Dependencies
const repl = require('repl');

// Start the REPL
repl.start({
   prompt: '>',
   eval: str => {
      console.log('At the evaluation stage: ', str);

      if (str.indexOf('input') > -1) {
         console.log('output');
      }
   }
});
