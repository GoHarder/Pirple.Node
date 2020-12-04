/**
 * A Library of various functions to test
 */

// Node Dependencies

// Project Dependencies

// Container for the functions
const lib = {};

lib.randomInteger = () => {
   return Math.floor(Math.random() * 25);
};

lib.randomLetter = () => {
   const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz';

   return possibleCharacters.charAt(lib.randomInteger());
};

// Export the module
module.exports = lib;
