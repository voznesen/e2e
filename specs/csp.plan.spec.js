/**
 * CSP Plan acceptance tests
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
  '../pages/csp.po.js',
  '../pages/csp.plan.po.js',
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
  CSPPlanPage,
  CSPAccountPage
) {
  tdd.suite('CSP Plan View', function() {
    var authPage,
      cspPage,
      cspPlanPage,
      cspAccountPage,
      dummyAccountEmail,
      dummySubscriber = {
        snid: null,
        phoneNumber: null
      };

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      cspPage = new CSPPage(this.remote);
      cspPlanPage = new CSPPlanPage(this.remote);
      cspAccountPage = new CSPAccountPage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return cspPage
            .createSubscriber()
            .then(function(subscriber) {
              dummySubscriber.snid = subscriber.snid;
            });
        });
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

    tdd.test('Create a dummy account for tests', function() {
      return cspPage.createAccount()
        .then(function(result) {
          expect(result.success).to.be.true;
          expect(result.emailAddress).not.to.be.null;
          dummyAccountEmail = result.emailAddress;
        })
        .sleep(5000);
    });

    tdd.test('Dummy subscriber lookup without security question', function() {
      return cspPage
        .openSubscriber(dummySubscriber.snid, true)
        .findById('csp-subscriber-id')
          .getVisibleText()
          .then(function(snid) {
            expect(snid).to.equal(dummySubscriber.snid);
          })
        .end()
        // Save the phone number for later tests
        .findByCssSelector('h4.phone-number')
          .getVisibleText()
          .then(function(text) {
            dummySubscriber.phoneNumber = text.replace(/\D+/, '');
            expect(dummySubscriber.phoneNumber).not.to.be.null;
          })
        .end();
    });

    tdd.suite('Bundled Plan', function() {
      tdd.test('Purchase bundle plan for later use', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .then(function() {
            return cspAccountPage.purchaseWithSku(1500047678);
          })
          .then(function() {
              // Check alert message
            return cspPage
              .getAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal('E2E Test Bundle Recurring Limited Cycles has been purchased.');
              });
          });
      });

      tdd.test('Cancel renewal of Bundled Limited plan', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('csp-plans-usage-tab')
            .click()
          .end()
          .findByXpath('.//csp-account-plans-usage-table//table/tbody//a[contains(text(), "E2E Test Bundle Recurring Limited Cycles")]')
            .click()
          .end()
          .findById('csp-bundle-details')
          .end()
          .then(function() {
            return cspPlanPage.clickCancelRenewal('bundle');
          })
          .then(function() {
            return cspPage
              .getAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(cspPlanPage.msgs.successfulCancelRenewal);
              });
          })
          .findDisplayedByCssSelector('span[ng-if="isRecurringBundledPlan() && bundle.subscription && bundle.subscription.lastBillingCycleId"]')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.equal('(Renewal Canceled)');
            })
          .end();
      });
    });

    tdd.suite('Setup Default Plan for Plan Actions Tests', function() {
      tdd.test('Purchase plan for later use', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .then(function() {
            return cspAccountPage.purchaseWithSku(1500028878);
          })
          .then(function() {
              // Check alert message
            return cspPage
              .getAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal('FE Automated Tests - Don’t Delete has been purchased.');
              });
          });
      });
    });

    tdd.suite('Header', function() {
      tdd.beforeEach(function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('csp-plans-usage-tab')
            .click()
          .end()
          .findByXpath('.//csp-account-plans-usage-table//table/tbody//a[contains(text(), "FE Automated Tests - Don’t Delete")]')
            .click()
          .end()
          .findById('csp-plan-details')
          .end();
      });

      tdd.test('Current Cycle', function() {
        return this.remote
          .findByCssSelector('.current-cycle')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.equal('1 (min. 1 - max. 5)');
            })
          .end();
      });

      tdd.suite('Plan actions', function() {
        tdd.test('Cancel renewal', function() {
          return cspPlanPage
            .isPlanRecurring()
            .then(function(isRecurring) {
              if (!isRecurring) {
                this.skip('Non-recurring plan, cancel renewal not applicable');
              }
            }.bind(this))
            .then(function() {
              return cspPlanPage.clickCancelRenewal('plan');
            })
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(alertMsg) {
                  expect(alertMsg).to.equal(cspPlanPage.msgs.successfulCancelRenewal);
                });
            })
            .findDisplayedByCssSelector('span[ng-if="plan.subscription.lastBillingCycleId"]')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.equal('(Renewal Canceled)');
              })
            .end();
        });

        tdd.test('Terminate plan', function() {
          return cspPlanPage
            .clickTerminatePlan()
            .findById('confirmOkBtn')
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(alertMsg) {
                  expect(alertMsg).to.equal(cspPlanPage.msgs.successfulTermination);
                });
            });
        });
      });
    });

    tdd.suite('Change shared allocation', function() {
      tdd.before(function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .then(function() {
            return cspAccountPage.addSubscriberToAccount(dummySubscriber.phoneNumber);
          });
      });

      tdd.test('Purchase shared allocation plan', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .then(function() {
            return cspAccountPage.purchaseWithSku(1500028878);
          })
          .then(function() {
            // Check alert message
            return cspPage
              .getAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal('FE Automated Tests - Don’t Delete has been purchased.');
              });
          });
      });

      tdd.test('Set new allocations', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('subs-table')
            .waitForDeletedByCssSelector('csp-spinner')
          .end()
          .findAllByCssSelector('#subs-table tbody tr')
            .then(function(trs) {
              expect(trs.length).to.be.above(1);
            })
          .end()
          .findById('csp-plans-usage-tab')
            .click()
          .end()
          .findByXpath('.//csp-account-plans-usage-table//table/tbody//a[contains(text(), "FE Automated Tests")]')
            .click()
          .end()
          .findById('csp-plan-details')
            .findByCssSelector('h4.plan-name')
              .getVisibleText()
                .then(function(txt) {
                  expect(txt).to.equal('FE Automated Tests - Don’t Delete (ID)');
                })
            .end()
          .end()
          .then(function() {
            return cspPlanPage
              .clickChangeSharedAllocation();
          })
          .findByCssSelector('#plan-allocator tbody tr:first-child td:last-child input.allocation-input')
            .click()
            .clearValue()
            .type('60')
          .end()
          .findByCssSelector('#plan-allocator tbody tr:last-child td:last-child input.allocation-input')
            .click()
            .clearValue()
            .type('40')
          .end()
          .findById('save-btn')
            .click()
          .end()
          .then(function() {
            return cspPage
              .getAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(cspPlanPage.msgs.successfulAllocation);
              });
          });
      });
    });
  });
});
