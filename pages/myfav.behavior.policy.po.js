/**
 * @author Peter Liang
 */
define(function(require) {
  var helper = require('../lib/helper');

  function MyFavBehaviorPolicyPage(remote) {
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
        .findById('navigLinkToMyFavBehaviorPolicy')
          .click()
        .end();
    };
  }

  return MyFavBehaviorPolicyPage;
});
