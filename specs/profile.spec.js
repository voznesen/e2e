/**
 * @author Tyler Van Hoomissen
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../pages/auth.po.js',
  '../pages/profile.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  ProfilePage
) {
  tdd.suite('Profile', function() {
    var authPage, profilePage;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      profilePage = new ProfilePage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.beforeEach(function() {
      return profilePage.open();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    /**
     * @see SAAS-3983
     */
    tdd.test('Validates first and last name length', function() {
      return profilePage
        // 62 is too long
        .fillInName(helper.getRandomString(62), helper.getRandomString(62))
        .findById('input_First_Name')
          .getProperty('value')
          .then(function(value) {
            expect(value.length).to.equal(60);
          })
        .end()
        .findById('input_Last_Name')
          .getProperty('value')
          .then(function(value) {
            expect(value.length).to.equal(60);
          })
        .end()
        .then(function() {
          return profilePage.clickChangeProfileBtn();
        })
        .then(function() {
          return profilePage
            .getAlertMessageText()
            .then(function(alertMsg) {
              expect(alertMsg).to.equal(profilePage.msgs.success);
            });
        })
        .then(function() {
          // Reset the name back to it's original
          return profilePage
            .fillInName(helper.AUTH.firstName, helper.AUTH.lastName)
            .then(function() {
              return profilePage.clickChangeProfileBtn();
            });
        });
    });

    tdd.test('Successfully changed first name and last name', function() {
      return profilePage
        .fillInName(helper.getRandomString(8), helper.getRandomString(8))
        .then(function() {
          return profilePage.clickChangeProfileBtn();
        })
        .then(function() {
          return profilePage
            .getAlertMessageText()
            .then(function(alertMsg) {
              expect(alertMsg).to.equal(profilePage.msgs.success);
            });
        })
        .then(function() {
          // Reset the name back to it's original
          return profilePage
            .fillInName(helper.AUTH.firstName, helper.AUTH.lastName)
            .then(function() {
              return profilePage.clickChangeProfileBtn();
            });
        });
    });

    tdd.test('Validates incorrect current password', function() {
      var newPassword = profilePage.getValidPassword();

      return profilePage
        .fillInPasswords('badpassword', newPassword, newPassword)
        .then(function() {
          return profilePage.clickChangePassBtn();
        })
        .then(function() {
          return profilePage
            .getAlertMessageText()
            .then(function(alertMsg) {
              expect(alertMsg).to.equal(profilePage.msgs.passwordFailure);
            });
        });
    });

    tdd.test('Validates new password requirements not met', function() {
      var badNewPassword = '123';

      return profilePage
        .fillInPasswords('badpassword', badNewPassword, badNewPassword)
        .findByCssSelector('body')
          .click()
        .end()
        .then(function() {
          return profilePage
            .clickChangePassBtn()
            .setFindTimeout(helper.getFindTimeout())
            .findDisplayedByCssSelector('div[ng-show="user.invalidPass"]')
              .getVisibleText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(profilePage.msgs.passwordRequirements);
              })
            .end()
            .findDisplayedByCssSelector('div[ng-show="user.invalidVerifyPass"]')
              .getVisibleText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(profilePage.msgs.passwordMismatch);
              })
            .end();
        });
    });

    tdd.test('Validates non-matching new passwords', function() {
      return profilePage
        .fillInPasswords('badpassword', profilePage.getValidPassword(), profilePage.getValidPassword())
        .findByCssSelector('body')
          .click()
        .end()
        .then(function() {
          return profilePage
            .clickChangePassBtn()
            .setFindTimeout(helper.getFindTimeout())
            .findDisplayedByCssSelector('div[ng-show="user.invalidVerifyPass"]')
              .getVisibleText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(profilePage.msgs.passwordMismatch);
              })
            .end();
        });
    });
  });
});
