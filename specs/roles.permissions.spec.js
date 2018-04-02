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
  '../pages/roles.permissions.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  RolePermissionsPage
) {
  tdd.suite('Roles and Permissions', function() {
    var authPage,
      rolePermissionsPage,
      roleName = helper.getRandomString();

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      rolePermissionsPage = new RolePermissionsPage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.beforeEach(function() {
      return rolePermissionsPage.open();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Validates role name on creation', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('select[ng-model="$parent.selectedRole"] option:not([selected="selected"])')
        .end()
        .then(function() {
          return rolePermissionsPage.clickAddRole();
        })
        .then(function() {
          return rolePermissionsPage
            .clickCreateAndGetAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(rolePermissionsPage.msgs.missingRoleName);
            });
        });
    });

    tdd.test('Validates assigned permissions on creation', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('select[ng-model="$parent.selectedRole"] option:not([selected="selected"])')
        .end()
        .then(function() {
          return rolePermissionsPage
            .clickAddRole()
            .findByCssSelector('input[ng-model="$parent.$parent.roleName"]')
              .click()
              .clearValue()
              .type(roleName)
            .end();
        })
        .then(function() {
          return rolePermissionsPage
            .clickCreateAndGetAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(rolePermissionsPage.msgs.missingPermission);
            });
        });
    });

    tdd.test('Successfully adds a role', function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('select[ng-model="$parent.selectedRole"] option:not([selected="selected"])')
        .end()
        .then(function() {
          return rolePermissionsPage
            .clickAddRole()
            .findByCssSelector('input[ng-model="$parent.$parent.roleName"]')
              .click()
              .clearValue()
              .type(roleName)
            .end();
        })
        .then(function() {
          return rolePermissionsPage.addPermissionByName('CSP_VIEW');
        })
        .then(function() {
          return rolePermissionsPage
            .clickCreateAndGetAlertMessageText()
            .then(function(msg) {
              helper.log('Added a role:', roleName);
              expect(msg).to.equal(rolePermissionsPage.msgs.addSuccess);
            });
        });
    });

    tdd.test('Deletes a role', function() {
      return rolePermissionsPage
        .deleteRoleByName(roleName)
        .then(function() {
          return rolePermissionsPage
            .getAlertMessageText()
            .then(function(msg) {
              helper.log('Deleted a role:', roleName);
              expect(msg).to.equal(rolePermissionsPage.msgs.deleteSuccess);
            });
        });
    });

    tdd.test('Successfully adds a role with an unlimited credit account limit', function() {
      // for the limit type of role
      var roleNameLimit = helper.getRandomString();

      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('select[ng-model="$parent.selectedRole"] option:not([selected="selected"])')
        .end()
        .then(function() {
          return rolePermissionsPage
            .clickAddRole()
            .findByCssSelector('input[ng-model="$parent.$parent.roleName"]')
              .click()
              .clearValue()
              .type(roleNameLimit)
            .end();
        })
        .then(function() {
          return rolePermissionsPage.addPermissionByName('CREDIT_ACCOUNT');
        })
        .findByCssSelector('input[ng-model="$parent.$parent.creditAccountModel.choice"][value="unlimited"]')
          .click()
        .end()
        .then(function() {
          return rolePermissionsPage
            .clickCreateAndGetAlertMessageText()
            .then(function(msg) {
              helper.log('Added a role:', roleNameLimit);
              expect(msg).to.equal(rolePermissionsPage.msgs.addSuccess);
              return rolePermissionsPage.closeAlertMessageText();
            });
        })
        .then(function() {
          return rolePermissionsPage.clickRoleByName(roleNameLimit);
        })
        .findDisplayedByCssSelector('users-set-limit')
          .findByCssSelector('input[ng-model="$parent.$parent.creditAccountModel.choice"][value="unlimited"]')
            .isSelected()
            .then(function(selected) {
              expect(selected).to.be.true;
            })
          .end()
        .end()
        .then(function() {
          return rolePermissionsPage.deleteRoleByName(roleNameLimit);
        })
        .then(function() {
          return rolePermissionsPage
            .getAlertMessageText()
            .then(function(msg) {
              helper.log('Deleted a role:', roleNameLimit);
              expect(msg).to.equal(rolePermissionsPage.msgs.deleteSuccess);
            });
        });
    });

    tdd.test('Successfully adds a role with a credit account limit of $50.00', function() {
      // for the limit type of role
      var roleNameLimit = helper.getRandomString();
      var limitValue = '50';

      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('select[ng-model="$parent.selectedRole"] option:not([selected="selected"])')
        .end()
        .then(function() {
          return rolePermissionsPage
            .clickAddRole()
            .findByCssSelector('input[ng-model="$parent.$parent.roleName"]')
              .click()
              .clearValue()
              .type(roleNameLimit)
            .end();
        })
        .then(function() {
          return rolePermissionsPage.addPermissionByName('CREDIT_ACCOUNT');
        })
        .findByCssSelector('input[ng-model="$parent.$parent.creditAccountModel.choice"][value="specified"]')
          .click()
        .end()
        .findByCssSelector('input[ng-model="$parent.$parent.creditAccountModel.limitMaxValue"]')
          .click()
          .clearValue()
          .type(limitValue)
        .end()
        .then(function() {
          return rolePermissionsPage.clickCreateRole();
        })
        .then(function() {
          return rolePermissionsPage
            .getAlertMessageText()
            .then(function(msg) {
              helper.log('Added a role:', roleNameLimit);
              expect(msg).to.equal(rolePermissionsPage.msgs.addSuccess);
              return rolePermissionsPage.closeAlertMessageText();
            });
        })
        .then(function() {
          return rolePermissionsPage.clickRoleByName(roleNameLimit);
        })
        .findDisplayedByCssSelector('users-set-limit')
          .findByCssSelector('input[ng-model="$parent.$parent.creditAccountModel.choice"][value="specified"]')
            .isSelected()
            .then(function(selected) {
              expect(selected).to.be.true;
            })
          .end()
          .findByCssSelector('input[ng-model="$parent.$parent.creditAccountModel.limitMaxValue"]')
            .getProperty('value')
            .then(function(value) {
              expect(value).to.equal(limitValue);
            })
        .end()
        .then(function() {
          return rolePermissionsPage.deleteRoleByName(roleNameLimit);
        })
        .then(function() {
          return rolePermissionsPage
            .getAlertMessageText()
            .then(function(msg) {
              helper.log('Deleted a role:', roleNameLimit);
              expect(msg).to.equal(rolePermissionsPage.msgs.deleteSuccess);
            });
        });
    });
  });
});
