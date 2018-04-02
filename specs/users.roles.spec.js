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
  '../pages/users.roles.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  UsersRolesPage
) {
  tdd.suite('Users and Roles', function() {
    var authPage,
      usersRolesPage,
      newUsername = helper.getRandomString(6).toLowerCase();

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      usersRolesPage = new UsersRolesPage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.beforeEach(function() {
      return usersRolesPage.open();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Validates email/username on creation', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#btn-Create_New_User:not([disabled="disabled"])')
        .end()
        .then(function() {
          return usersRolesPage.clickAddUser();
        })
        .then(function() {
          // Just bad usernames
          return usersRolesPage
            .fillInUsernames('a', 'a')
            .then(function() {
              return usersRolesPage
                .getAlertMessageText()
                .then(function(msg) {
                  expect(msg).to.equal(usersRolesPage.msgs.usernameError);
                });
            });
        })
        .then(function() {
          // Let's try non matching good usernames
          return usersRolesPage.fillInUsernames(
            helper.getRandomString(6),
            helper.getRandomString(6)
          )
          .then(function() {
            return usersRolesPage
              .getAlertMessageText()
              .then(function(msg) {
                expect(msg).to.equal(usersRolesPage.msgs.usernameError);
              });
          });
        });
    });

    tdd.test('Successfully creates a new user by username', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#btn-Create_New_User:not([disabled="disabled"])')
        .end()
        .then(function() {
          return usersRolesPage.clickAddUser();
        })
        .then(function() {
          return usersRolesPage.fillInUsernames(newUsername, newUsername);
        })
        .then(function() {
          return usersRolesPage.addRoleByName('VIEWER');
        })
        .then(function() {
          // Validate that the role got assigned
          return this.parent
            .findByXpath('//select[@id="assignedRoles"]/option[contains(.,"VIEWER")]')
            .end();
        })
        .then(function() {
          return usersRolesPage.addPartnerByName('Acme Telecom');
        })
        .then(function() {
          // Validate that the partner got assigned
          return this.parent
            .findByXpath('//select[@id="assignedPartners"]/option[contains(.,"Acme Telecom")]')
            .end();
        })
        .then(function() {
          return usersRolesPage
            .clickCreateUser()
            .findById('confirmOkBtn')
              .click()
            .end();
        })
        .then(function() {
          return usersRolesPage
            .getAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(usersRolesPage.msgs.creationSuccess);
            });
        });
    });

    tdd.test('Successfully sends a reset password email', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#btn-Create_New_User:not([disabled="disabled"])')
        .end()
        .then(function() {
          return usersRolesPage
            .selectUserByUsername(newUsername)
            // This find ensures that the user has loaded fully before deletion
            .findByXpath('//select[@id="assignedRoles"]/option[contains(.,"VIEWER")]')
            .end()
            .findDisplayedByCssSelector('button[ng-click="resetPassword()"]:not([disabled="disabled"])')
              .click()
            .end();
        })
        .then(function() {
          return usersRolesPage
            .getAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(usersRolesPage.msgs.resetSuccess);
            });
        });
    });

    tdd.test('Deletes a user by username', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#btn-Create_New_User:not([disabled="disabled"])')
        .end()
        .then(function() {
          return usersRolesPage
            .selectUserByUsername(newUsername)
            // This find ensures that the user has loaded fully before deletion
            .findByXpath('//select[@id="assignedRoles"]/option[contains(.,"VIEWER")]')
            .end()
            .findDisplayedByCssSelector('button[ng-click="remove()"]:not([disabled="disabled"])')
              .click()
            .end()
            .findById('confirmOkBtn')
              .click()
            .end();
        })
        .then(function() {
          return usersRolesPage
            .getAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(usersRolesPage.msgs.deletionSuccess);
            });
        });
    });
  });
});
