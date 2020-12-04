/*
 * Virtual Machine Example
 */

// Node Dependencies
const vm = require('vm');

// Project Dependencies

// Define a context for the script to run in
const context = {
   foo: 25
};

const script = new vm.Script(`

   foo = foo * 2;
   var bar = foo + 1;
   var fizz = 52;

`);

// Run the script
script.runInNewContext(context);
console.log(context);
