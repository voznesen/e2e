/**
 * CSP Subscriber acceptance tests
 * @author Moe Hosseini
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../lib/vendor/faker.js',
  '../pages/auth.po.js',
  '../pages/csp.po.js',
  '../pages/csp.subscriber.po.js',
  '../pages/csp.account.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage,
  CSPPage,
  CSPSubscriberPage,
  CSPAccountPage
) {
  tdd.suite('CSP Subscriber View', function() {
    var authPage,
      cspPage,
      cspSubscriberPage,
      dummyAccountEmail,
      dummySubscriber = {
        snid: null,
        phoneNumber: null
      };

      tdd.before(function() {
        authPage = new AuthPage(this.remote);
        cspPage = new CSPPage(this.remote);
        cspSubscriberPage = new CSPSubscriberPage(this.remote);
        cspAccountPage = new CSPAccountPage(this.remote);

        return authPage.loginAndSetCurrentPartner();
      });

      tdd.after(function() {
        return cspPage
          .destroyAccount(dummyAccountEmail)
          .then(function() {
            return authPage.logout();
          });
      });

      tdd.afterEach(function(test) {
        helper.reportFailure(this.remote, test);
      });

      tdd.suite('Devtools', function() {
        tdd.test('Create a dummy account for tests', function() {
          return cspPage.createAccount()
            .then(function(result) {
              expect(result.success).to.be.true;
              expect(result.emailAddress).not.to.be.null;
              dummyAccountEmail = result.emailAddress;
            })
            .sleep(5000);
        });
      });

      tdd.test('Account has at least one subscriber', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .setFindTimeout(60000) // one minute timeout for this step, really slow
          .findByCssSelector('#subs-table tbody tr:first-child td:nth-child(2)')
            .getVisibleText()
            .then(function(phoneNumber) {
              expect(phoneNumber).not.to.be.null;
              // store the phone number for easier access to the attached snid
              dummySubscriber.phoneNumber = phoneNumber.replace(/\D+/g, '');
            })
          .end();
      });

      tdd.test('Mandatory Product Status table loads', function() {
        return cspPage
          .openSubscriber(dummySubscriber.phoneNumber)
          .findById('csp-mandatory-product-tab')
            .click()
          .end()
          .findByCssSelector('#mandatory-product td:not(.dataTables_empty)')
          .end()
          .findAllByCssSelector('#mandatory-product tbody tr')
            .then(function(trs) {
              expect(trs.length).to.be.above(1);
            })
          .end();
      });

      tdd.suite('Header', function() {
        tdd.test('Data is present', function() {
          return cspPage
            .openSubscriber(dummySubscriber.phoneNumber)
            .findByCssSelector('.csp-layout header h4.phone-number')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.equal('Phone: ' + dummySubscriber.phoneNumber);
              })
            .end();
        });

        tdd.suite('Subscriber actions', function() {
          tdd.suite('Manage Preferred Voice Numbers', function() {
            var rows;
            
            tdd.test('Check Preferred Voice Numbers table', function() {
              return cspPage
                .openAccount(dummyAccountEmail)
                .then(function() {
                  return cspAccountPage.purchaseWithSku(100082218);
                })
                .then(function() {
                  // Check alert message
                  return cspPage
                    .getAlertMessageText()
                    .then(function(alertMsg) {
                      expect(alertMsg).to.equal('MYFAV has been purchased.');
                    });
                })
                .then(function() {
                  return cspPage.openSubscriber(dummySubscriber.phoneNumber);
                })
                .findById('csp-preferred-voice-tab')
                  .click()
                .end()
                .findById('pref-voice-table')
                  .setFindTimeout(60000)
                  .waitForDeletedByCssSelector('csp-spinner')
                .end()
                .findAllByCssSelector('#pref-voice-table tbody tr')
                  .then(function(trs) {
                    rows = trs.length;
                    expect(trs.length).to.be.above(1);
                  })
                .end();
            });

            tdd.test('Manage Preferred Voice Numbers', function() {
              return cspSubscriberPage
                .clickSubscriberManagePreferredVoiceNumbers()
                .findAllByCssSelector('#preferred-numbers-form table tbody tr')
                  .then(function(trs) {
                    expect(trs.length).to.equal(rows);
                  })
                .end();
            });
          });

          tdd.suite('Suspend/resume subscriber', function() {
            tdd.test('Suspend', function() {
              return cspPage
                .openSubscriber(dummySubscriber.phoneNumber)
                .then(function() {
                  return cspSubscriberPage.clickSubscriberSuspendResume();
                })
                .findByCssSelector('.modal-body')
                  .findAllByCssSelector('input[ng-model="reason.isSelected"]')
                    .click()
                  .end()
                .end()
                .findByCssSelector('.modal-footer button.btn-primary:not(.disabled)')
                  .getVisibleText()
                  .then(function(buttonText) {
                    expect(buttonText).to.equal('Suspend Subscriber');
                  })
                  .click()
                .end()
                .then(function() {
                  return cspPage
                    .getAlertMessageText()
                    .then(function(alertText) {
                      expect(alertText).to.equal(cspSubscriberPage.msgs.successfulSuspend);
                    });
                });
            });
          });

          tdd.suite('Manage policies and features', function() {
            tdd.test('Enable a feature', function() {
              return cspPage
                .openSubscriber(dummySubscriber.phoneNumber)
                .then(function() {
                  return cspSubscriberPage.clickSubscriberManagePolicies();
                })
                .findDisplayedByCssSelector('.modal-header h4')
                  .getVisibleText()
                  .then(function(headerTxt) {
                    expect(headerTxt).to.equal('eCommerce Policies and Features');
                  })
                .end()
                .findByCssSelector('.modal-body')
                  .findByCssSelector('.grid-msg-overlay.ng-hide')
                  .end()
                  .findByCssSelector('.ui-grid-cell-contents input[type="checkbox"]:first-child')
                    .click()
                  .end()
                .end()
                .findById('cspSaveBtn')
                  .click()
                .end()
                .findById('confirmOkBtn')
                  .click()
                .end()
                .findDisplayedByCssSelector('message-box span.message')
                  .getVisibleText()
                  .then(function(msg) {
                    expect(msg).to.equal(cspSubscriberPage.msgs.successfulFeatureUpdate);
                  })
                .end();
            });

            tdd.test('Disable a feature', function() {
              return cspPage
                .openSubscriber(dummySubscriber.phoneNumber)
                .then(function() {
                  return cspSubscriberPage.clickSubscriberManagePolicies();
                })
                .findDisplayedByCssSelector('.modal-header h4')
                  .getVisibleText()
                  .then(function(headerTxt) {
                    expect(headerTxt).to.equal('eCommerce Policies and Features');
                  })
                .end()
                .findByCssSelector('.modal-body')
                  .findByCssSelector('.grid-msg-overlay.ng-hide')
                  .end()
                  .findByCssSelector('.ui-grid-cell-contents input[type="checkbox"]:checked:first-child')
                    .click()
                  .end()
                .end()
                .findById('cspSaveBtn')
                  .click()
                .end()
                .findById('confirmOkBtn')
                  .click()
                .end()
                .findDisplayedByCssSelector('message-box span.message')
                  .getVisibleText()
                  .then(function(msg) {
                    expect(msg).to.equal(cspSubscriberPage.msgs.successfulFeatureUpdate);
                  })
                .end();
            });
          });

          tdd.test('View number transfer PIN', function() {
            return cspPage
              .openSubscriber(dummySubscriber.phoneNumber)
              .then(function() {
                return cspSubscriberPage.clickSubscriberViewNumTransferPIN();
              })
              .findByCssSelector('figure[us-spinner]:not(.visible)')
              .end()
              .findDisplayedByCssSelector('.modal-body')
                .findDisplayedByCssSelector('.center-text strong')
                  .getVisibleText()
                  .then(function(pin) {
                    expect(pin.length).to.equal(4);
                  })
                .end()
              .end()
              .findById('confirmOkBtn')
                .click()
              .end();
          });
        });
      });

      tdd.suite('Status area', function() {
        tdd.test('Notification language', function() {
          this.skip('Currently disabled by SAAS-16651');

          var originalLanguage;

          return cspPage
            .openSubscriber(dummySubscriber.phoneNumber)
            .findByCssSelector('figure[us-spinner]:not(.visible)')
            .end()
            .findByCssSelector('aside.status-area a.notification-language')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.equal('English');
                originalLanguage = text;
              })
              .click()
            .end()
            .findByCssSelector('.modal-body select[ng-model="data.selected"] > option[value="2"]')
              .click()
            .end()
            .findById('cspSaveBtn')
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(alertMsg) {
                  expect(alertMsg).to.equal(cspSubscriberPage.msgs.successfulNotifLangUpdate);
                });
            })
            .findByCssSelector('aside.status-area a.notification-language')
              .getVisibleText()
              .then(function(text) {
                expect(text).not.to.equal(originalLanguage);
                expect(text).to.equal('Español');
              })
            .end();
        });
      });
  });
});
