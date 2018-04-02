/**
 * CSP Device acceptance tests
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
  '../pages/csp.device.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage,
  CSPPage,
  CSPDevicePage
) {
  tdd.suite('CSP Device View', function() {
    var authPage,
      cspPage,
      cspDevicePage,
      dummySubscriber = {};

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      cspPage = new CSPPage(this.remote);
      cspDevicePage = new CSPDevicePage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return cspPage
            .createSubscriber()
            .then(function(subscriber) {
              dummySubscriber.snid = subscriber.snid;
            })
            // This sleep is deliberate. It fixes a bug where the subscriber
            // isn't ready in the first MEID exists test, I think because
            // the acceptance tests are too fast.
            .sleep(5000);
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.suite('Header', function() {
      tdd.test('MEID exists', function() {
        return cspPage
          .openDeviceBySnid(dummySubscriber.snid)
          .findByCssSelector('b.MEID-value')
            .getVisibleText()
            .then(function(MEID) {
              expect(MEID).to.have.length;
            })
          .end();
      });

      tdd.suite('Device Actions', function() {
        tdd.beforeEach(function() {
          return cspPage.openDeviceBySnid(dummySubscriber.snid);
        });

        tdd.test('Get client log', function() {
          return cspDevicePage
            .clickRequestClientLog()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(text) {
                  expect(text).to.equal(cspDevicePage.msgs.successfulClientLog);
                });
            });
        });

        tdd.test('Suspend device', function() {
          return cspDevicePage
            .clickSuspendResume()
            .findDisplayedByCssSelector('.modal-header h4')
              .getVisibleText()
              .then(function(headerText) {
                expect(headerText).to.equal('Confirm Suspend');
              })
            .end()
            .findById('confirmOkBtn')
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(text) {
                  expect(text).to.equal(cspDevicePage.msgs.successfulSuspend);
                });
            })
            .then(function() {
              return cspDevicePage
                .getDeviceStatus()
                .then(function(status) {
                  expect(status).to.equal(cspDevicePage.statuses.suspended);
                });
            });
        });

        tdd.test('Resume device', function() {
          return cspDevicePage
            .clickSuspendResume()
            .findDisplayedByCssSelector('.modal-header h4')
              .getVisibleText()
              .then(function(headerText) {
                expect(headerText).to.equal('Confirm Resume');
              })
            .end()
            .findById('confirmOkBtn')
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(text) {
                  expect(text).to.equal(cspDevicePage.msgs.successfulResume);
                });
            })
            .then(function() {
              return cspDevicePage
                .getDeviceStatus()
                .then(function(status) {
                  expect(status).to.equal(cspDevicePage.statuses.active);
                });
            });
        });

        tdd.test('Disable account joining', function() {
          // @see SAAS-16543
          this.skip("Test devices currently don't support this feature");
        });

        tdd.test('Enable account joining', function() {
          // @see SAAS-16543
          this.skip("Test devices currently don't support this feature");
        });
      });
    });
  });
});
