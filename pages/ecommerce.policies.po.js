/**
 * @author Peter Liang
 */
define(function(require) {
  var helper = require('../lib/helper');

  function EcommercePoliciesPage(remote) {
    this.remote = remote;

    /**
     * Naviages to the eCommerce policies page
     * @return {promise}
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findById('navigLinkToPolicy')
          .click()
        .end()
        .findById('navigLinkToEcommercePolicies')
          .click()
        .end();
    };

    /**
     * Create a new policy
     * @param {string} type
     * @param {object} data
     * @return {promise}
     */
    this.create = function(type, data) {
      var newButton;

      if (type == 'data') {
        newButton = '#create-new-ecommerce-policy-btn-group ul.dropdown-menu #data-selection-li > a';
      }
      else if (type == 'voice') {
        newButton = '#create-new-ecommerce-policy-btn-group ul.dropdown-menu #voice-selection-li > a';
      }
      else if (type == 'messaging') {
        newButton = '#create-new-ecommerce-policy-btn-group ul.dropdown-menu #message-selection-li > a';
      }

      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('#create-new-ecommerce-policy-btn-group button.btn-primary')
          .click()
        .end()
        .findByCssSelector(newButton)
          .moveMouseTo()
        .end()
        .findById('create-new-'+ type + '-selection')
          .click()
        .end()
        .findById('policy-name')
          .click()
          .type(data.name)
        .end()
        .findById('policy-description')
          .click()
          .type(data.description)
        .end()
        .findByCssSelector('.modal-footer .btn-primary')
          .click()
        .end()
        .findByCssSelector('div[ng-controller="FeatureWorkflowCtrl"]')
        .end()
        .then(function() {
          return true;
        });
    };

    /**
     * Helper to let the spinner finish
     * @return {promise}
     */
    this.waitForTableLoading = function() {
      return this.remote
        .findByCssSelector('#features-table_processing[style*="visibility: hidden;"]')
        .end();
    };
  }

  return EcommercePoliciesPage;
});
