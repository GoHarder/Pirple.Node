/*
 * This library is supposed to make things explode and kill node when init() is called
 */

// Container for the module
var lib = {};

// Init function
lib.init = () => {
   // Intentional error
   var foo = bar;
};

// Export the module
module.exports = lib;
