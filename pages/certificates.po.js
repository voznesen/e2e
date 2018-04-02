/**
 * @author Peter Liang
 */
define(function(require) {
  var helper = require('../lib/helper');

  function CertificatesPage(remote) {
    this.remote = remote;

    /**
     * Naviages to the certificates page
     * @return {promise}
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findById('navigLinkToPolicy')
          .click()
        .end()
        .findById('navigLinkToCertificates')
          .click()
        .end();
    };

    /**
     * Upload a new certificate
     * @return {promise}
     */
    this.upload = function() {
      return this.remote
        .end()
        .then(function() {
          return helper.attachFile(this.remote, 'upload-button input[type="file"]', 'Certificate.ioappinfo');
        }.bind(this));
    };
  }

  return CertificatesPage;
});
