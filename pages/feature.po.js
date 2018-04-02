/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function FeaturePage(remote) {
    this.remote = remote;

    /**
     * Naviages to the feature page
     * @return {promise}
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findById('navigLinkToPolicy')
          .click()
        .end()
        .findById('navigLinkToFeatures')
          .click()
        .end()
        .findByCssSelector('a[ng-click="selectTab(\'plan\')"]')
        .end();
    };

    /**
     * Create a new feature
     * @param {string} type
     * @param {object} data
     * @return {promise}
     */
    this.create = function(type, data) {
      var newButton = type == 'publishable' ?
        '#createNewServiceBtnGroup ul.dropdown-menu li:first-child a' :
        '#createNewServiceBtnGroup ul.dropdown-menu li:last-child a';

      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('#createNewServiceBtnGroup button.btn-primary')
          .click()
        .end()
        .findByCssSelector(newButton)
          .click()
        .end()
        .findById('input-Feature_Name')
          .click()
          .type(data.name)
        .end()
        .findById('input_featureCode')
          .click()
          .type(data.code)
        .end()
        .findById('input-Feature_Description')
          .click()
          .type(data.description)
        .end()
        .findById('confirmAction_btn')
          .click()
        .end()
        .findByCssSelector('div[ng-controller="FeatureWorkflowCtrl"]')
        .end()
        .then(function() {
          return true;
        });
    };
  }

  return FeaturePage;
});
