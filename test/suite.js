import './globals.js';

/* global require */

var allTests = require.context('.', true, /.*Spec\.js$/);

allTests.keys().forEach(allTests);