/**
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
  '../pages/network.groups.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage,
  NetworkGroupsPage
) {
  tdd.suite('Network Groups', function() {
    var authPage,
      PO,
      newName;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      PO = new NetworkGroupsPage(this.remote);

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

    tdd.suite('Create', function() {
      tdd.test('Error case', function() {
        return PO
          .clickNewButton()
          .then(function() {
            return PO.fillInModal({
              name: faker.lorem.word(),
              SIDNIDBSID: faker.lorem.word(),
              MCCMNC: faker.lorem.word()
            });
          })
          .then(function() {
            return PO.getModalAlertMessageText()
              .then(function(msg) {
                expect(msg).to.equal('2 Total Error');
              });
          })
          .then(function() {
            return PO.clickModalCancelButton();
          })
          .waitForDeletedByCssSelector('.modal-dialog-wrapper')
          .end()
          .sleep(1000);
      });

      tdd.test('Successful case', function() {
        newName = 'fe_tests_' + helper.getRandomString();
        helper.log('Creating Network Group with name: ' + newName);

        return PO
          .clickNewButton()
          .then(function() {
            return PO.fillInModal({
              name: newName,
              SIDNIDBSID: PO.getRandomSID() + '/' + PO.getRandomBSID(),
              MCCMNC: PO.getRandomMCC() + '/' + PO.getRandomMNC()
            });
          })
          .then(function() {
            return PO.getModalAlertMessageText()
              .then(function(text) {
                expect(text).to.equal('1 SID/NID/BSID entry accepted, 1 MCC/MNC entry accepted');
              });
          })
          .then(function() {
            return PO.clickModalSaveButton();
          })
          .waitForDeletedByCssSelector('.modal-dialog-wrapper')
          .end()
          .then(function() {
            return PO
              .getAlertMessageText()
              .then(function(msg) {
                expect(msg).to.equal(PO.msgs.successfulCreate);
              });
          })
          .sleep(1000);
      });
    });

    tdd.test('Update', function() {
      var oldName = newName;
      newName = 'fe_tests_' + helper.getRandomString();

      return PO
        .searchByName(oldName)
        .findById('row_0')
          .then(function(element) {
            // We gotta hover to show the delete button
            return this.parent.moveMouseTo(element);
          })
        .end()
        .findById('edit_row_0')
          .click()
        .end()
        .then(function() {
          return PO.clickModalLockButton();
        })
        .then(function() {
          return PO.updateModal({
            name: newName,
            SIDNIDBSID: PO.getRandomSID() + '/' + PO.getRandomBSID(),
            MCCMNC: PO.getRandomMCC() + '/' + PO.getRandomMNC()
          });
        })
        .then(function() {
          return PO.getModalAlertMessageText()
            .then(function(text) {
              expect(text).to.equal('2 SID/NID/BSID entries accepted, 2 MCC/MNC entries accepted');
            });
        })
        .then(function() {
          return PO.clickModalSaveButton();
        })
        .findById('confirmOkBtn')
          .click()
        .end()
        .waitForDeletedByCssSelector('.modal-dialog-wrapper')
        .end()
        .then(function() {
          return PO
            .getAlertMessageText()
            .then(function(msg) {
              expect(msg).to.equal(PO.msgs.successfulUpdate);
            });
        })
        .sleep(1000);
    });

    tdd.test('Search', function() {
      return PO
        .searchByName(newName)
        .findByCssSelector('#groups-table td:first-child')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal(newName);
          })
        .end()
        .sleep(1000);
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
        .findById('remove_row_0')
          .click()
        .end()
        .findById('confirmOkBtn')
          .click()
        .end()
        .waitForDeletedByCssSelector('.modal-dialog-wrapper')
        .end()
        // Wait for loading to complete
        .findByCssSelector('#groups-table_processing[style*="visibility: hidden;"]')
        .end()
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
