# Unit Testing Backbone.js Applications

Here is what each folder and file contains:

* `todos.html`: The skeleton HTML file for our application.
* `testem.json`: The configuration file for Test'Em.
* `api/`: A folder for our REST API implementation.
  * `api/htaccess`: Sample configuration for the Apache web server that supports our REST API.
  * `api/todos.php`: PHP code to implement the REST API.
* `lib/`: A folder for Javascript libraries used by the app itself and the test framework.
  * `lib/backbone-min.js`: Minified version of Backbone.js.
  * `lib/chai.js`: Chai Assertion Library.
  * `lib/jquery-1.9.0.min.js`: Minified version of jQuery.
  * `lib/sinon-1.5.2.js`: Sinon.JS library.
  * `lib/sinon-chai.js`: Sinon.JS Assertions for Chai.
  * `lib/underscore-min.js`: Minified version of Underscore.js.
* `mysql/`: A folder for MySQL code for the application.
  * `mysql/todos.sql`: MySQL commands to create the application database.
* `php-lib/`: A folder for PHP libraries and configuration for the application's REST API.
  * `php-lib/dbconfig.inc.php`: PHP database configuration for the REST API.
* `src/`: A folder for our client-side application code.
  * `src/app-todos.js`: Our application.
* `test/`: A folder for test code.
  * `test/app-todos-test.js`: Test code for our application.
  * `test/mocha.opts`: Configuration options for mocha; we'll look at this in the next section.
