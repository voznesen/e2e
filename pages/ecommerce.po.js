/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function EcommercePage(remote) {
    this.remote = remote;

    /**
     * Private helper to open the pages
     * @param {string} url - The url to open
     * @param {bool} switchToIframeContext - Helper to quickly switch to
     *   this context (you'll probably want this).
     * @return {object} promise
     */
    this._open = function(url, switchToIframeContext) {
      return this.remote
        .get(helper.getHostUrl(url))
        .findDisplayedById('operator-iframe-window')
        .end()
        .then(function() {
          if (typeof switchToIframeContext === 'undefined' || switchToIframeContext === true) {
            return this.switchToIframeContext();
          }
        }.bind(this));
    };

    /**
     * Open the Catalog & Notifications page
     * @param {bool} switchToIframeContext - Helper to quickly switch to
     *   this context (you'll probably want this).
     * @return {object} promise
     */
    this.openCatalogNotifications = function(switchToIframeContext) {
      return this._open('/operator/index#/commerce', switchToIframeContext);
    };

    /**
     * Open the Notification Bodies page
     * @param {bool} switchToIframeContext - Helper to quickly switch to
     *   this context (you'll probably want this).
     * @return {object} promise
     */
    this.openNotificationBodies = function(switchToIframeContext) {
      // return this._open('/operator/index/?url=/notification/list#/commerce', switchToIframeContext);
      return this.remote.get(helper.getHostUrl('/notification/list'));
    };

    /**
     * Since these pages live within the iframe, we need to
     * change the find context to within the iframe
     * @return {object} promise
     */
    this.switchToIframeContext = function() {
      return this.remote
        .findAllByTagName('iframe')
        .then(function(frames) {
          return this.parent.switchToFrame(frames[0]);
        })
        .end();
    };

    /**
     * In the sidebar
     * @return {object} promise
     */
    this.clickFixedEventNotification = function() {
      return this.remote
        .findByCssSelector('#sideMenu li a[ng-click="refresh(\'FIXEDEVENT\')"]')
        .click()
        .end();
    };

    /**
     * In the sidebar
     * @return {object} promise
     */
    this.clickUsageNotification = function() {
      return this.remote
        .findByCssSelector('#sideMenu li a[ng-click="refresh(\'USAGE\')"]')
        .click()
        .end();
    };

    /**
     * In the sidebar
     * @return {object} promise
     */
    this.clickBlockNotification = function() {
      return this.remote
        .findByCssSelector('#sideMenu li a[ng-click="refresh(\'BLOCK\')"]')
        .click()
        .end();
    };

    /**
     * All notifications share this button
     * @return {object} promise
     */
    this.clickAddNotificationBody = function() {
      return this.remote
        .findByCssSelector('button[ng-click="createNotification(notificationType)"]')
        .click()
        .end();
    };

    /**
     * Get the text of the button
     * @return {object}
     */
    this.getAddNotificationBodyButtonText = function() {
      return this.remote
        .findByCssSelector('button[ng-click="createNotification(notificationType)"]')
        .getVisibleText()
        .then(function(text) {
          return text;
        });
    };

    /**
     * @return {object} promise
     */
    this.getAddNotificationModalHeaderText = function() {
      return this.remote
        .findDisplayedByCssSelector('div.broadleaf-modal .modal-header > h4')
        .getVisibleText()
        .then(function(text) {
          return text;
        });
    };

    /**
     * @param {string} name
     * @param {string} notes
     * @param {string} fixedEventName - The exact name of the label
     *   when adding a fixed event. Do not use the label ENUM value.
     */
    this.fillInNotificationModal = function(name, notes, fixedEventName) {
      helper.log('Creating notification body with name: ' + name);

      return this.remote
        .findByCssSelector('div.broadleaf-modal')
            .findById('notificationName')
                .click()
                .clearValue()
                .type(name)
            .end()
            .findById('notificationNotes')
                .click()
                .clearValue()
                .type(notes)
            .end()
            .then(function() {
              if (fixedEventName) {
                return this.parent
                  .findByCssSelector('select[ng-model="form.fixedEventType"]')
                  .findByXpath('//option[contains(.,"' + fixedEventName + '")]')
                  .click()
                  .end()
                  .end();
              }
            })
            .findByCssSelector('button.submit-button')
                .click()
            .end()
        .end()
        .findById('btn-saveAndFinalizeNotification')
        .end();
    };
  }

  return EcommercePage;
});
