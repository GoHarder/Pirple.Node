/*
 * Unit Tests
 */

// Node Dependencies
const assert = require('assert');

// Dependencies
const app = require('../app/lib');

// Holder for Tests
const unit = {};

unit['app.randomInteger returns a random integer from 0 to 25'] = done => {
   const val = app.randomInteger();
   assert.strictEqual(typeof val, 'number');
   assert.ok(val <= 25);
   done();
};

unit['app.randomLetter returns a random letter'] = done => {
   const val = app.randomLetter();
   assert.strictEqual(typeof val, 'string');
   done();
};

// Export the tests to the runner
module.exports = unit;
