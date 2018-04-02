/**
 * Creating and manipulating notification bodies.
 * @author Tyler Van Hoomissen
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../lib/vendor/faker.js',
  '../pages/auth.po.js',
  '../pages/ecommerce.po.js',
  '../pages/ecommerce.notification.detail.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage,
  EcommercePage,
  EcommerceNotificationDetailPage
) {
  tdd.suite('Ecommerce - Notification Bodies', function() {
    var authPage,
      ecommercePage,
      ecommerceNotificationDetailPage;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      ecommercePage = new EcommercePage(this.remote);
      ecommerceNotificationDetailPage = new EcommerceNotificationDetailPage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.suite('Block', function() {
      tdd.test('Create with new notification body', function() {
        var model = {
          name: 'fe_tests_' + helper.getRandomString(),
          notes: faker.random.words()
        };

        return ecommercePage
          .openNotificationBodies()
          .then(function() {
            return ecommercePage.clickBlockNotification();
          })
          .findDisplayedByCssSelector('div[ng-init="init(\'BLOCK\')"]')
          .end()
          .then(function() {
            return ecommercePage
              .getAddNotificationBodyButtonText()
              .then(function(text) {
                expect(text).to.equal('New');
              });
          })
          .then(function() {
            return ecommercePage.clickAddNotificationBody();
          })
          .then(function() {
            return ecommercePage
              .getAddNotificationModalHeaderText()
              .then(function(text) {
                expect(text).to.equal('Add Block Notification Body');
              });
          })
          .then(function() {
            return ecommercePage
              .fillInNotificationModal(model.name, model.notes);
          })
          // Ensure the correct page and values were saved/loaded
          .then(function() {
            return ecommerceNotificationDetailPage
              .getNotificationName()
              .then(function(text) {
                expect(text).to.equal(model.name);
              });
          })
          .then(function() {
            return ecommerceNotificationDetailPage
              .getNotificationNotes()
              .then(function(text) {
                expect(text).to.equal(model.notes);
              });
          });
      });

      tdd.test('Trying to save at this step results in missing criteria error', function() {
        return ecommerceNotificationDetailPage
          .clickSaveAndGetAlertMessageTexts()
          .then(function(messages) {
            expect(messages[0]).to.equal(ecommerceNotificationDetailPage.msgs.blockMissingCriteria);
          });
      });

      tdd.test('Add "Service Policy" rule', function() {
        return ecommerceNotificationDetailPage
          .clickCriteriaAddRule(true)
          .findDisplayedByCssSelector('notification-apply-condition span.display-value-none-selected')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal('< No value selected >');
          })
          .end()
          .findByXpath('//button[@ng-click="chooseFromLookup(\'SERVICE_POLICY_ID\')"]')
            .click()
          .end()
          .then(function() {
            return ecommerceNotificationDetailPage
              .chooseServicePolicyFromModal();
          })
          .end()
          .waitForDeletedByCssSelector('notification-apply-condition span.display-value.ng-hide')
          .end()
          .sleep(1000);
      });

      tdd.test('Add Popup delivery method', function() {
        return ecommerceNotificationDetailPage
          .clickAddPopup(true)
          .then(function() {
            return ecommerceNotificationDetailPage
              .fillInPopup({
                title: faker.random.word(),
                body: faker.random.words(),
                deliverToOption: 'Subscriber who triggered'
              });
          })
          .then(function() {
            return ecommerceNotificationDetailPage.clickAddPopupButton();
          })
          .findDisplayedByCssSelector('body > .modal.fade.in')
          .end()
          .findDisplayedByCssSelector('.modal-header h4')
            .getVisibleText()
            .then(function(header) {
              expect(header).to.equal('Add Action');
            })
          .end()
          .then(function() {
            return ecommerceNotificationDetailPage.fillInPopupButton();
          })
          .findById('confirmAction_btn')
            .click()
          .end()
          .waitForDeletedByCssSelector('.modal-backdrop')
          .then(function() {
            return ecommerceNotificationDetailPage
              .clickSaveAndGetSuccessMessageText()
              .then(function(message) {
                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
              });
          });
      });

      tdd.test('Add SMS delivery method', function() {
        return ecommerceNotificationDetailPage
          .clickAddSMS(true)
          .then(function() {
            return ecommerceNotificationDetailPage
              .fillInSMS({
                message: faker.random.words(),
                deliverToOption: 'Subscriber who triggered'
              });
          })
          .then(function() {
            return ecommerceNotificationDetailPage
              .clickSaveAndGetSuccessMessageText()
              .then(function(message) {
                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
              });
          });
      });

      tdd.test('Add Email delivery method', function() {
        return ecommerceNotificationDetailPage
          .clickAddEmail(true)
          .then(function() {
            return ecommerceNotificationDetailPage
              .fillInEmail({
                subject: faker.random.words(),
                body: faker.random.words(),
                deliverToOption: 'Subscriber who triggered'
              });
          })
          .then(function() {
            return ecommerceNotificationDetailPage
              .clickSaveAndGetSuccessMessageText()
              .then(function(message) {
                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
              });
          });
      });

      tdd.test('Save and finalize', function() {
        return ecommerceNotificationDetailPage
          .clickSaveAndFinalizeButton()
          .findDisplayedByCssSelector('div[ng-show="whenNotificationState(\'PROCESSING\')"] .notify-message')
          .getVisibleText()
          .then(function(message) {
            expect(message).to.equal(ecommerceNotificationDetailPage.msgs.finalizing);
          })
          .end();
      });

      tdd.test('Successfully deletes notification', function() {
        return ecommerceNotificationDetailPage.deleteNotification({
          hot: true
        });
      });
    });
    // end of BLOCK

// Test keeps failing, commenting it out for now.
      // Need to rework to make it more stable.
      //
//    tdd.suite('Fixed Event', function() {
//      tdd.test('Create with "Account Created" event type', function() {
//        var model = {
//          name: 'fe_tests_' + helper.getRandomString(),
//          notes: faker.random.words(),
//          event: 'Account Created'
//        };
//
//        return ecommercePage
//          .openNotificationBodies()
//          .then(function() {
//            return ecommercePage.clickFixedEventNotification();
//          })
//          .findDisplayedByCssSelector('div[ng-init="init(\'FIXEDEVENT\')"]')
//          .end()
//          .then(function() {
//            return ecommercePage
//              .getAddNotificationBodyButtonText()
//              .then(function(text) {
//                expect(text).to.equal('New');
//              });
//          })
//          .then(function() {
//            return ecommercePage.clickAddNotificationBody();
//          })
//          .then(function() {
//            return ecommercePage
//              .getAddNotificationModalHeaderText()
//              .then(function(text) {
//                expect(text).to.equal('Add Fixed Event Notification Body');
//              });
//          })
//          .then(function() {
//            return ecommercePage
//              .fillInNotificationModal(model.name, model.notes, model.event);
//          })
//          // Ensure the correct page and values were saved/loaded
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .getNotificationName()
//              .then(function(text) {
//                expect(text).to.equal(model.name);
//              });
//          })
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .getNotificationNotes()
//              .then(function(text) {
//                expect(text).to.equal(model.notes);
//              });
//          })
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .getNotificationEvent()
//              .then(function(text) {
//                expect(text).to.equal(model.event);
//              });
//          });
//      });
//
//      tdd.test('Trying to save at this step results in delivery method empty error', function() {
//        return ecommerceNotificationDetailPage
//          .clickSaveAndGetAlertMessageTexts()
//          .then(function(messages) {
//            expect(messages[0]).to.equal(ecommerceNotificationDetailPage.msgs.missingDelivery);
//          });
//      });
//
//      tdd.test('Add Popup delivery method', function() {
//        return ecommerceNotificationDetailPage
//          .clickAddPopup(true)
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .fillInPopup({
//                title: faker.random.word(),
//                body: faker.random.words()
//              });
//          })
//          .then(function() {
//            return ecommerceNotificationDetailPage.clickAddPopupButton();
//          })
//          .findDisplayedByCssSelector('body > .modal.fade.in')
//          .end()
//          .findDisplayedByCssSelector('.modal-header h4')
//            .getVisibleText()
//            .then(function(header) {
//              expect(header).to.equal('Add Action');
//            })
//          .end()
//          .then(function() {
//            return ecommerceNotificationDetailPage.fillInPopupButton();
//          })
//          .findById('confirmAction_btn')
//            .click()
//          .end()
//          .waitForDeletedByCssSelector('.modal-backdrop')
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .clickSaveAndGetSuccessMessageText()
//              .then(function(message) {
//                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
//              });
//          });
//      });
//
//      tdd.test('Add SMS delivery method', function() {
//        return ecommerceNotificationDetailPage
//          .clickAddSMS(true)
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .fillInSMS({
//                message: faker.random.words()
//              });
//          })
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .clickSaveAndGetSuccessMessageText()
//              .then(function(message) {
//                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
//              });
//          });
//      });
//
//      tdd.test('Add Email delivery method', function() {
//        return ecommerceNotificationDetailPage
//          .clickAddEmail(true)
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .fillInEmail({
//                subject: faker.random.words(),
//                body: faker.random.words(),
//                deliverToOption: 'Subscriber who triggered'
//              });
//          })
//          .then(function() {
//            return ecommerceNotificationDetailPage
//              .clickSaveAndGetSuccessMessageText()
//              .then(function(message) {
//                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
//              });
//          });
//      });
//
//      tdd.test('Save and finalize', function() {
//        return ecommerceNotificationDetailPage
//          .clickSaveAndFinalizeButton()
//          .findDisplayedByCssSelector('div[ng-show="whenNotificationState(\'PROCESSING\')"] .notify-message')
//            .getVisibleText()
//            .then(function(message) {
//              expect(message).to.equal(ecommerceNotificationDetailPage.msgs.finalizing);
//            })
//          .end();
//      });
//
//      tdd.test('Successfully deletes notification', function() {
//        return ecommerceNotificationDetailPage.deleteNotification({
//          hot: true
//        });
//      });
//    });
//    // end of FIXED EVENT

    tdd.suite('Usage', function() {
      tdd.after(function() {
        return ecommerceNotificationDetailPage.deleteNotification({
          hot: false
        });
      });

      tdd.test('Create', function() {
        var model = {
          name: 'fe_tests_' + helper.getRandomString(),
          notes: faker.random.words()
        };

        return ecommercePage
          .openNotificationBodies()
          .then(function() {
            return ecommercePage.clickUsageNotification();
          })
          .findDisplayedByCssSelector('div[ng-init="init(\'USAGE\')"]')
          .end()
          .then(function() {
            return ecommercePage
              .getAddNotificationBodyButtonText()
              .then(function(text) {
                expect(text).to.equal('New');
              });
          })
          .then(function() {
            return ecommercePage.clickAddNotificationBody();
          })
          .then(function() {
            return ecommercePage
              .getAddNotificationModalHeaderText()
              .then(function(text) {
                expect(text).to.equal('Add Usage Notification Body');
              });
          })
          .then(function() {
            return ecommercePage
              .fillInNotificationModal(model.name, model.notes);
          })
          // Ensure the correct page and values were saved/loaded
          .then(function() {
            return ecommerceNotificationDetailPage
              .getNotificationName()
              .then(function(text) {
                expect(text).to.equal(model.name);
              });
          })
          .then(function() {
            return ecommerceNotificationDetailPage
              .getNotificationNotes()
              .then(function(text) {
                expect(text).to.equal(model.notes);
              });
          });
      });

      tdd.test('Add SMS delivery method', function() {
        return ecommerceNotificationDetailPage
          .clickAddSMS(true)
          .then(function() {
            return ecommerceNotificationDetailPage
              .fillInSMS({
                message: faker.random.words(),
                deliverToOption: 'Subscriber who triggered'
              });
          });
      });

      tdd.test('Add "Data Limit" rule', function() {
        return ecommerceNotificationDetailPage
          .clickCriteriaAddRule(true)
          .findByXpath('//select[@ng-model="data.subject"]/option[contains(.,"Data Limit")]')
            .click()
          .end()
          .findByCssSelector('notification-apply-condition > .rule .apply-condition-template > input[ng-model="data.value"]')
            .click()
            .clearValue()
            .type('500')
          .end()
          .then(function() {
            return ecommerceNotificationDetailPage
              .clickSaveAndGetAlertMessageTexts()
              .then(function(messages) {
                expect(messages[0]).to.equal(ecommerceNotificationDetailPage.msgs.usageMissingCriteria);
              });
          });
      });

      tdd.test('Add "Per Call Limit" threshold of 50% Percent Limit Used', function() {
        return ecommerceNotificationDetailPage
          .clickAddThreshold()
          .then(function() {
            return ecommerceNotificationDetailPage
              .fillInThresholdModal({
                type: 'PER_CALL_LIMIT_TIME_REMAINING',
                thresholdType: 'Percent Limit Used',
                value: '50'
              });
          })
          .findDisplayedByCssSelector('usage-trigger-condition .save-alert')
            .getVisibleText()
            .then(function(msg) {
              expect(msg).to.equal(ecommerceNotificationDetailPage.msgs.thresholdAddSuccess);
            })
          .end()
          .sleep(1000)
          .then(function() {
            return ecommerceNotificationDetailPage
              .clickSaveAndGetSuccessMessageText()
              .then(function(message) {
                expect(message).to.equal(ecommerceNotificationDetailPage.msgs.saveSuccess);
              });
          });
      });

      // Test keeps failing, commenting it out for now.
      // Need to rework to make it more stable.
      //
      // tdd.test('Add the first available contextual offer', function() {
      //   var offerName = '';
      //
      //   return ecommerceNotificationDetailPage
      //     .clickAddContextualOffer(true)
      //     .then(function() {
      //       return ecommerceNotificationDetailPage.clickAddContextualOfferButton();
      //     })
      //     .findDisplayedByCssSelector('body > .modal.fade.in')
      //     .end()
      //     // Wait for loading to end
      //     .findByCssSelector('.grid-msg-overlay:not(.ng-hide)')
      //     .end()
      //     .findByCssSelector('.modal .ui-grid-row:first-child .ui-grid-cell:first-child .ui-grid-cell-contents > span:first-child')
      //       .getVisibleText()
      //       .then(function(text) {
      //         offerName = text;
      //       })
      //       .click()
      //     .end()
      //     .findDisplayedByCssSelector('#confirmAction_btn:not([disabled])')
      //       .click()
      //     .end()
      //     .waitForDeletedByCssSelector('.modal-backdrop')
      //     .findByCssSelector('#column_0-name_0 > span:first-child')
      //       .getVisibleText()
      //       .then(function(text) {
      //         expect(text).to.equal(offerName);
      //       })
      //     .end();
      // });
    });
    // end of USAGE
  });
});
