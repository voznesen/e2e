/**
 * Specific to plan pages
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function CSPPlanPage(remote) {
    this.remote = remote;
    this.msgs = {
      successfulCancelRenewal: 'Plan renewal canceled, plan will not renew at the end of its cycle',
      successfulTermination: 'Plan termination requested. Termination can take a couple of minutes. Please check status and plan history for updates.',
      successfulAllocation: 'Allocation updates saved.'
    };

    /**
     * Retrieve the plan name from the H4 on the page
     * @return {object} promise
     */
    this.getPlanNameHeaderText = function() {
      return this.remote
        .findByCssSelector('h4.plan-name')
          .getVisibleText()
          .then(function(text) {
            return text;
          });
    };

    /**
     * Retrieve the plan current cycle in the header
     * @return {object} promise
     */
    this.getCurrentCycleText = function() {
      return this.remote
        .findByCssSelector('b.current-cycle')
          .getVisibleText()
          .then(function(text) {
            return text;
          });
    };

    /**
     * @return {object} promise
     */
    this.clickPlanActions = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findById('csp-plan-actions')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickBundleActions = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findById('csp-bundle-actions')
          .click()
        .end();
    };

    /**
     * From the plan actions menu
     * @return {object} promise
     */
    this.clickCancelRenewal = function(type) {
      if (type == 'bundle') {
        return this
          .clickBundleActions()
          .then(function() {
            return this.parent
              .findByCssSelector('a[ng-click="changeSubscriptionRenewalState(\'cancel\')"]')
                .click()
              .end();
          });
      }
      else {
        return this
          .clickPlanActions()
          .then(function() {
            return this.parent
              .findByCssSelector('a[ng-click="changeSubscriptionRenewalState(\'cancel\')"]')
                .click()
              .end();
          });
      }
    };

    /**
     * From the plan actions menu
     * @return {object} promise
     */
    this.clickTerminatePlan = function() {
      return this
        .clickPlanActions()
        .then(function() {
          return this.parent
            .findByCssSelector('a[ng-click="terminatePlan()"]')
              .click()
            .end();
        });
    };

    /**
     * Use the label to determine
     * @return {object} promise
     */
    this.isPlanRecurring = function() {
      return this.remote
        .findByCssSelector('h5.plan-type-label')
          .getVisibleText()
          .then(function(text) {
            return text != 'Non-recurring Plan';
          })
        .end();
    };

    /**
     * Change shared allocation
     * @return {object} promise
     */
    this.clickChangeSharedAllocation = function() {
      return this
        .clickPlanActions()
        .then(function() {
          return this.parent
            .findByCssSelector('a[ng-click="changeSharedAllocations()"]:not(.disabled-link)')
              .click()
            .end();
        });
    };
  }

  return CSPPlanPage;
});
