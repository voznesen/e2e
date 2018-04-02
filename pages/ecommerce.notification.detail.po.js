/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function EcommerceNotificationDetailPage(remote) {
    this.remote = remote;

    this.msgs = {
      saveSuccess: 'Success',
      missingDelivery: 'Delivery Method must be defined before Save',
      finalizing: 'This notification body is finalizing…',
      usageMissingCriteria: 'At least one rule and one threshold must be in each usage notification body criterion',
      blockMissingCriteria: 'At least one rule must be in a notification body criterion',
      thresholdAddSuccess: 'Add success'
    };

    /**
     * Returns an array of messages because multiple
     * can be shown on the page. This will only return
     * the error messages.
     * @return {object<array>} promise
     */
    this.getAlertMessageTexts = function() {
      return this.remote
        // Ensure any loading is done before
        .findByCssSelector('img.ajax-loader.ng-hide[ng-show="inProgress()"]')
        .end()
        .findAllByCssSelector('#notification-issues p')
          .then(function(elements) {
            return Promise.all(elements.map(function(element) {
              return element.getVisibleText();
            }));
          });
    };

    /**
     * Only returns success message
     * @return {object}
     */
    this.getSuccessMessageText = function() {
      return this.remote
        // Ensure any loading is done before
        .findByCssSelector('img.ajax-loader.ng-hide[ng-show="inProgress()"]')
        .end()
        .findByCssSelector('#headerFlashAlertBox .alert-box-message')
          .getVisibleText()
          .then(function(message) {
            return message;
          });
    };

    /**
     * @return {object} promise
     */
    this.getNotificationName = function() {
      return this.remote
        .findById('notificationName')
          .getProperty('value')
          .then(function(text) {
            return text;
          });
    };

    /**
     * @return {object} promise
     */
    this.getNotificationNotes = function() {
      return this.remote
        .findById('notificationNotes')
          .getProperty('value')
          .then(function(text) {
            return text;
          });
    };

    /**
     * @return {object} promise
     */
    this.getNotificationEvent = function() {
      return this.remote
        .findById('notificationEvent')
          .getVisibleText()
          .then(function(text) {
            return text;
          });
    };

    /**
     * Click the delete on the notification detail page
     * @return {object} promise
     */
    this.clickDeleteButton = function() {
      return this.remote
        .findDisplayedById('btn-removeNotification')
          .click()
        .end()
        // Wait for the modal to animate
        // @TODO Refactor out sleep
        .sleep(1000);
    };

    /**
     * @return {object} promise
     */
    this.clickSaveButton = function() {
      return this.remote
        .findDisplayedById('btn-saveNotification')
          .click()
        .end();
    };

    /**
     * Combinational helper
     * @return {array}
     */
    this.clickSaveAndGetAlertMessageTexts = function() {
      return this.clickSaveButton()
        .then(function() {
          return this.getAlertMessageTexts();
        }.bind(this));
    };

    /**
     * Combinational helper
     * @return {string}
     */
    this.clickSaveAndGetSuccessMessageText = function() {
      return this.clickSaveButton()
        .then(function() {
          return this.getSuccessMessageText();
        }.bind(this));
    };

    /**
     * @return {object} promise
     */
    this.clickSaveAndFinalizeButton = function() {
      return this.remote
        .findDisplayedById('btn-saveAndFinalizeNotification')
          .click()
        .end();
    };

    /**
     * @param {bool} option - true = yes, false = no
     * @return {object}
     */
    this.clickAddAudio = function(option) {
      return this.remote
        .findByCssSelector('notification-delivery-option[data="form.notificationAudibles"]')
        .then(function() {
          if (option) {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="yes"]')
                .click()
              .end();
          } else {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="no"]')
                .click()
              .end();
          }
        })
        .end();
    };

    /**
     * @param {bool} option - true = yes, false = no
     * @return {object}
     */
    this.clickAddSMS = function(option) {
      return this.remote
        .findByCssSelector('notification-delivery-option[data="form.notificationSMS"]')
        .then(function() {
          if (option) {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="yes"]')
                .click()
              .end();
          } else {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="no"]')
                .click()
              .end();
          }
        })
        .end();
    };

    /**
     * @param {bool} option - true = yes, false = no
     * @return {object}
     */
    this.clickAddPopup = function(option) {
      return this.remote
        .findByCssSelector('notification-delivery-option[data="form.notificationTexts"]')
        .then(function() {
          if (option) {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="yes"]')
                .click()
              .end();
          } else {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="no"]')
                .click()
              .end();
          }
        })
        .end();
    };

    /**
     * @param {bool} option - true = yes, false = no
     * @return {object}
     */
    this.clickAddEmail = function(option) {
      return this.remote
        .findByCssSelector('notification-delivery-option[data="form.notificationEmail"]')
        .then(function() {
          if (option) {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="yes"]')
                .click()
              .end();
          } else {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="no"]')
                .click()
              .end();
          }
        })
        .end();
    };

    /**
     * @param {object} params
     * @param {string} params.message
     * @param {string} params.deliverToOption
     * @return {object}
     */
    this.fillInSMS = function(params) {
      return this.remote
        .findByCssSelector('notification-sms .redactor_twelve')
          .click()
          .clearValue()
          .type(params.message)
        .end()
        .then(function() {
          if (params.deliverToOption) {
            return this.parent
              .findByXpath('//notification-deliver-to[contains(@ng-model,"sms.primary.deliverTo")]//select/option[contains(.,"' + params.deliverToOption + '")]')
                .click()
              .end();
          }
        });
    };

    /**
     * @param {object} params
     * @param {string} params.title
     * @param {string} params.body
     * @param {string} params.deliverToOption
     * @return {object}
     */
    this.fillInPopup = function(params) {
      return this.remote
        .findById('notificationContentTitle')
          .click()
          .clearValue()
          .type(params.title)
        .end()
        .findByCssSelector('notification-texts .redactor_twelve')
          .click()
          .clearValue()
          .type(params.body)
        .end()
        .then(function() {
          if (params.deliverToOption) {
            return this.parent
              .findByXpath('//notification-deliver-to[contains(@ng-model,"texts.primary.deliverTo")]//select/option[contains(.,"' + params.deliverToOption + '")]')
              .click()
              .end();
          }
        });
    };

    /**
     * @TODO Add template selection
     * @param {object} params
     * @param {object} params.subject
     * @param {object} params.body
     */
    this.fillInEmail = function(params) {
      return this.remote
        .findById('notificationEmailSubject')
          .click()
          .clearValue()
          .type(params.subject)
        .end()
        .findByCssSelector('notification-email .redactor_twelve')
          .click()
          .clearValue()
          .type(params.body)
        .end();
    };

    /**
     * @return {object}
     */
    this.clickAddPopupButton = function() {
      return this.remote
        .findByCssSelector('notification-buttons button.sub-list-grid-add')
          .click()
        .end();
    };

    /**
     * Currently this defaults to a launch url type button
     * @return {object}
     */
    this.fillInPopupButton = function() {
      return this.remote
        .findByXpath('//select[@id="select-button-actions"]/option[contains(.,"Launch Url")]')
          .click()
        .end()
        .findByCssSelector('input[ng-model="$parent.form.page"]')
          .click()
          .clearValue()
          .type('URL')
        .end()
        .findByCssSelector('input[ng-model="$parent.form.label"]')
          .click()
          .clearValue()
          .type('LABEL')
        .end();
    };

    /**
     * Add a new rule yo
     * @return {object}
     */
    this.clickCriteriaAddRule = function(option) {
      return this.remote
        .findByCssSelector('notification-delivery-option[data="data.conditions"]')
        .then(function() {
          if (option) {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="yes"]')
                .click()
              .end();
          } else {
            return this.parent
              .findByCssSelector('input[ng-model="radio.value"][value="no"]')
                .click()
              .end();
          }
        })
        .end()
        .findByCssSelector('a[ng-click="addBtnClicked(\'condition\')"]')
          .click()
        .end();
    };

    /**
     * @param {object} params
     * @param {boolean} params.hot Is it a hot deletion
     * @return {object}
     */
    this.deleteNotification = function(params) {
      return this
        .getNotificationName()
        .then(function(name) {
          helper.log('Deleting notification body with name: ' + name);
          return this.clickDeleteButton();
        }.bind(this))
        .end()
        .then(function() {
          if (params.hot) {
            return this.remote
              .findDisplayedByCssSelector('body > .modal.fade.in')
              .end()
              .findDisplayedByCssSelector('button.delete-button[ng-click="ok()"]')
                .click()
              .end()
              .findDisplayedByCssSelector('button[ng-click="createNotification(notificationType)"]')
              .end();
          }
        }.bind(this));
    };

    /**
     * For usage notifications, etc
     * @return {object} promise
     */
    this.clickAddThreshold = function() {
      return this.remote
        .findByCssSelector('usage-trigger-condition button[ng-click="add(\'add\')"]')
          .click()
        .end()
        // Wait for the modal to animate
        // @TODO Refactor out sleep
        .sleep(1000);
    };

    /**
     * Automatically hits the save button in the modal when finished
     * @param {object} params
     * @param {string} params.type - The main type
     * @param {string} params.value - The main value
     * @param {string} params.thresholdType - The sub type next to threshold
     */
    this.fillInThresholdModal = function(params) {
      return this.remote
        .findDisplayedByCssSelector('.modal-dialog')
          .findByCssSelector('input[ng-model="triggerCondition.unitRemainingType"][value="' + params.type + '"]')
            .click()
          .end()
          .findByXpath('//select[@ng-model="triggerCondition.thresholdOption"]/option[contains(.,"' + params.thresholdType + '")]')
            .click()
          .end()
          .findByCssSelector('input[ng-model="triggerCondition.value"]')
            .click()
            .clearValue()
            .type(params.value)
          .end()
          .findById('confirmAction_btn')
            .click()
          .end()
        .end()
        .waitForDeletedByCssSelector('.modal-backdrop.fade.in')
        .end();
    };

    /**
     * @param {bool} option - true = yes, false = no
     * @return {object}
     */
    this.clickAddContextualOffer = function(option) {
      return this.remote
        .then(function() {
          if (option) {
            return this.parent
              .findByCssSelector('upsell-configurations input[ng-model="upsell"][value="1"]')
                .click()
              .end();
          } else {
            return this.parent
              .findByCssSelector('upsell-configurations input[ng-model="upsell"][value="0"]')
                .click()
              .end();
          }
        });
    };

    /**
     * @return {object}
     */
    this.clickAddContextualOfferButton = function() {
      return this.remote
        .findByCssSelector('upsell-offers button[ng-click="add()"]')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.chooseServicePolicyFromModal = function(params) {
      return this.remote
        .findDisplayedByCssSelector('body > .modal.fade.lookup-modal-class.in')
        .end()
        .findByCssSelector(".ui-grid-canvas .ui-grid-row[ng-repeat='(rowRenderIndex, row) in rowContainer.renderedRows track by $index']:first-child")
          .click()
        .end()
        .waitForDeletedByCssSelector('body.modal-open')
        .end();
    };

  }

  return EcommerceNotificationDetailPage;
});
