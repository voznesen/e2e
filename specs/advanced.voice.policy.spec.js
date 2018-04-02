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
  '../pages/advanced.voice.policy.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  AdvancedVoicePolicyPage
) {
  tdd.suite('Advanced Voice Accounting Policy', function() {
    var authPage,
      PO,
      newName;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      PO = new AdvancedVoicePolicyPage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return PO.open();
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Create', function() {
      newName = 'fe_tests_' + helper.getRandomString();

      return PO
        .clickNewButton()
        .then(function() {
          return PO.fillInModal({
            name: newName,
            gracePeriod: '150',
            accountingIncrement: '160',
            chargeDuration: '170'
          });
        })
        .then(function() {
          return PO.clickModalSaveButton();
        })
        .then(function() {
          return PO
            .getAlertMessageText()
            .then(function(msg) {
              var expected = newName + ' ' + PO.msgs.successfulCreate;
              expect(msg).to.equal(expected);
            });
        });
    });

    tdd.test('Update', function() {
      var oldName = newName;
      newName = 'fe_tests_' + helper.getRandomString();

      return PO
        .open()
        .then(function() {
          return PO.searchByName(oldName);
        })
        .findById('row_0')
          .then(function(element) {
            // We gotta hover to show the delete button
            return this.parent.moveMouseTo(element);
          })
        .end()
        .findByCssSelector('#row_0 button.btn-edit')
          .click()
        .end()
        .then(function() {
          return PO.clickModalUnlockButton();
        })
        .then(function() {
          return PO.fillInModal({
            name: newName,
            gracePeriod: '250',
            accountingIncrement: '260',
            chargeDuration: '270'
          });
        })
        .then(function() {
          return PO.clickModalSaveButton();
        })
        .then(function() {
          return PO
            .getAlertMessageText()
            .then(function(msg) {
              var expected = newName + ' ' + PO.msgs.successfulUpdate;
              expect(msg).to.equal(expected);
            });
        });
    });

    tdd.test('Search', function() {
      return PO
        .open()
        .then(function() {
          return PO.searchByName(newName);
        })
        .findByCssSelector('#policies-table td:first-child')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal(newName);
          })
        .end();
    });

    tdd.test('Destroy', function() {
      return PO
        .searchByName(newName)
        .findById('row_0')
          .then(function(element) {
            // We gotta hover to show the delete button
            return this.parent.moveMouseTo(element);
          })
        .end()
        .findByCssSelector('#row_0 button.btn-remove')
          .click()
        .end()
        .findById('confirmOkBtn')
          .click()
        .end()
        .waitForDeletedByCssSelector('.modal-dialog-wrapper')
        .end()
        // Wait for loading to complete
        // .findByCssSelector('#policies-table-filter[style*="visibility: hidden;"]')
        // .end()
        .then(function() {
          return PO
            .getAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(PO.msgs.successfulDestroy);
            });
        });
    });
  });
});
