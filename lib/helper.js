/**
 * Holds global methods and variables to be used by all tests.
 * @example
 *   var helper = require('../lib/helper.js');
 *   helper.getHostUrl();
 * @author Tyler Van Hoomissen
 */
define([
  'intern',
  'intern/dojo/node!url',
  'intern/dojo/node!fs',
  'intern/dojo/node!path',
  'intern/dojo/node!leadfoot/keys'
], function(intern, url, fs, path, keys) {
  return {
    AUTH: {
      username: 'fe_tests',
      password: 'Password1!',
      // This is just a dummy email for now
      email: 'fe_tests@itsoninc.com',
      firstName: 'FE',
      lastName: 'TESTS'
    },

    /**
     * Returns the current build host url
     * @param {string} append Route to append to url
     * @return {string}
     */
    getHostUrl: function(append) {
      if (!append) append = '';
      return intern.args.hostUrl + append;
    },

    /**
     * Get the default timeout that is set by the intern config
     * @return {number}
     */
    getFindTimeout: function() {
      return parseInt(intern.args.defaultFindTimeout);
    },

    /**
     * Get a random string with specified length
     * @param {number} length - Set the length, defaults to 8
     * @return {string}
     */
    getRandomString: function(length, charSet) {
      length = length || 8;
      charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var randomString = '';
      for (var i = 0; i < length; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
      }
      return randomString;
    },

    /**
     * Returns a random email at @itsoninc.com domain
     * unless another is specified.
     * @param {number} length
     * @param {domain} domain - Default: itsoninc.com
     */
    getRandomEmail: function(length, domain) {
      length = length || 8;
      domain = '@' + (domain || 'itsoninc.com');
      return this.getRandomString(length) + domain;
    },

    /**
     * Break a url down into parts.
     * @param {string} href The url you want to parse
     * @return {object} returns the url properties
     * @example
     *  var urlObj = helper.parseUrl('http://example.com:3000/pathname/?search=test#hash');
     *  urlObj.protocol; // => "http:"
     *  urlObj.hostname; // => "example.com"
     *  urlObj.port;     // => "3000"
     *  urlObj.pathname; // => "/pathname/"
     *  urlObj.search;   // => "?search=test"
     *  urlObj.hash;     // => "#hash"
     *  urlObj.host;     // => "example.com:3000"
     */
     parseUrl: function(href) {
       return url.parse(href);
     },

     /**
      * @param {object} remote - this.remote
      * @return {null}
      */
     takeScreenshot: function(remote) {
       var sessionId = remote._session._sessionId;

       return remote.takeScreenshot().then(function(buffer) {
         var now = new Date().toISOString()
          .slice(0, 19)
          .replace('T', '_')
          .replace(/:/g, '-');
         var smallSessionId = sessionId.substr(sessionId.length - 12);
         var filename = '/tmp/screen_' + smallSessionId + '_' + now + '.png';

         fs.writeFileSync(filename, buffer);
         this.log('Took a screenshot:', filename);

         return filename;
       }.bind(this));
     },

     /**
      * @param {object} remote
      * @param {string} cssSelector
      * @param {string} filename
      * @return {object} promise
      */
     attachFile: function(remote, cssSelector, filename) {
       var __dirname = path.resolve(path.dirname(''));
       var filepath = path.resolve(__dirname  + '/../tests/e2e/lib/attachments/' + filename);
       return remote.findByCssSelector(cssSelector).type(filepath);
     },

     /**
      * This will take a screenshot to /tmp and it will also
      * write to the error log in /var/log
      * @param {object} remote
      * @param {object} test - The test obj from intern
      * @return {null}
      */
     reportFailure: function(remote, test) {
       if (!test.error) return;

       // Currently this is just the location for a long on Hercules only
       var logLocation = '/var/log/httpd/acc-tests-failures.log';

       this.takeScreenshot(remote).then(function(screenFilename) {
         var errorMsg = (new Date().toISOString());
         errorMsg += ' - ' + screenFilename;
         errorMsg += ' - ' + test.name + ' - ' + test.error.message + '\n';

         fs.appendFile(logLocation, errorMsg, function(err) {
           if (!err) this.log('Wrote error to: ' + logLocation);
         }.bind(this));
       }.bind(this));
     },

     /**
      * Replacement for console.log so that the output
      * may be toggled by an intern flag.
      * Use intern.args.debug to switch it.
      * @return {null}
      */
     log: function() {
       if (!intern.args.debug) return;
       [].unshift.call(arguments, 'DEBUG:');
       console.log.apply(this, arguments);
     },

     /**
      * Helper to press return on the keyboard.
      * @param {object} remote
      * @return {object} promise
      */
     pressEnter: function(remote) {
       return remote.pressKeys(keys.RETURN);
     }
  };
});
