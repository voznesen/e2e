/**
 * @author Tyler Van Hoomissen
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../pages/auth.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage
) {
  tdd.suite('Auth', function() {
    var authPage;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Unsuccessful login with bad username', function() {
      return this.remote
        .get(helper.getHostUrl())
        .then(function() {
          return authPage.fillInAuth('badusername', helper.AUTH.password);
        })
        .then(function() {
          return authPage
            .getAlertMessageText()
            .then(function(alertMsg) {
              expect(alertMsg).to.equal(authPage.msgs.invalidLogin);
            });
        });
    });

    tdd.test('Unsuccessful login with bad password', function() {
      return this.remote
        .get(helper.getHostUrl())
        .then(function() {
          return authPage.fillInAuth(helper.AUTH.username, 'badpassword');
        })
        .then(function() {
          return authPage
            .getAlertMessageText()
            .then(function(alertMsg) {
              expect(alertMsg).to.equal(authPage.msgs.invalidLogin);
            });
        });
    });

    tdd.test('Unsuccessful login with no username or password', function() {
      return this.remote
        .get(helper.getHostUrl())
        .then(function() {
          return authPage.fillInAuth('', '');
        })
        .then(function() {
          return authPage
            .getAlertMessageText()
            .then(function(alertMsg) {
              expect(alertMsg).to.equal(authPage.msgs.missingFields);
            });
        });
    });

    tdd.test('Successful login', function() {
      return this.remote
        .get(helper.getHostUrl())
        .then(function() {
          return authPage.fillInAuth(helper.AUTH.username, helper.AUTH.password);
        })
        .findByCssSelector('div[ng-controller="NavigCtrl"]')
        .end()
        .getCurrentUrl()
        .then(function(url) {
          expect(url.indexOf('site/dashboard') > -1).to.be.true;
        });
    });

    tdd.test('Logging out', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        // Make sure we're logged in already
        .getCurrentUrl()
        .then(function(url) {
          expect(url.indexOf('site/dashboard') > -1).to.be.true;
        })
        .findById('logoutmenu')
          .click()
        .end()
        .findById('btn_logout')
          .click()
        .end()
        .findByCssSelector('div[ng-controller="PortalUserProfileCtrl"]')
          .getCurrentUrl()
          .then(function(url) {
            expect(url.indexOf('site/login/?notify=') > -1).to.be.true;
          })
        .end()
        .clearCookies();
    });

    tdd.test('Resetting password', function() {
      return this.remote
        .get(helper.getHostUrl())
        .findById('UserLoginForgotPasswordBtn')
          .click()
        .end()
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('input#email')
          .click()
          .type(helper.AUTH.email)
        .end()
        .findById('submitBtn')
          .click()
        .end()
        .findById('LoginForm_username')
          .isDisplayed()
          .then(function(isDisplayed) {
            expect(isDisplayed).to.be.true;
          })
        .end()
        .findDisplayedByCssSelector('#login-ui-container .alert .message')
          .isDisplayed()
          .then(function(isDisplayed) {
            expect(isDisplayed).to.be.true;
          })
        .end()
        .findDisplayedByCssSelector('#login-ui-container .alert .message')
          .getVisibleText()
          .then(function(text) {
            var msg = 'If the email you entered ' + helper.AUTH.email + ' is associated with an account';
            msg += ', you will receive a message containing password reset instructions.';
            expect(text).to.equal(msg);
          })
        .end();
    });
  });
});
