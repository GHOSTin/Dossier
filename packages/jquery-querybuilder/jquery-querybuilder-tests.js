// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by jquery-querybuilder.js.
import { name as packageName } from "meteor/ghostin:jquery-querybuilder";

// Write your tests here!
// Here is an example.
Tinytest.add('jquery-querybuilder - example', function (test) {
  test.equal(packageName, "jquery-querybuilder");
});
