/**
 * @author Peter Liang
 */
define([
  'require'
], function(require) {
  var helper = require('../lib/helper');

  function SubscriberGroupsPage(remote) {
    this.remote = remote;

    this.msgs = {
      successfulCreation: 'Subscriber group added'
    };

    /**
     * Naviages to the subscriber groups page
     * @return {promise}
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findById('navigLinkToPolicy')
          .click()
        .end()
        .findById('navigLinkToSubscriberGroups')
          .click()
        .end();
    };

    /**
     * Create a new subscriber group
     * @param {object} data
     * @return {promise}
     */
    this.create = function(data) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#createNewGroupBtn')
          .click()
        .end()
        .findById('name')
          .click()
          .type(data.name)
        .end()
        .findById('inputSubscriberGroup')
          .click()
          .type(data.number)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end()
        .findById('addOkBtn')
          .click()
        .end()
        .then(function() {
          return true;
        });
    };
  }

  return SubscriberGroupsPage;
});
