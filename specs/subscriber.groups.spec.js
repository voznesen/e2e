/**
 * @author Peter Liang
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../pages/auth.po.js',
  '../pages/subscriber.groups.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  SubscriberGroupsPage
) {
  tdd.suite('Subscriber Groups', function() {
    var authPage,
      subscriberGroupsPage,
      groupName = helper.getRandomString(),
      newNumber = '6509998888';

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      subscriberGroupsPage = new SubscriberGroupsPage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return subscriberGroupsPage.open();
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Creating a new subscriber group', function() {
      return subscriberGroupsPage
        .create({
          name: groupName,
          number: newNumber,
        })
        .then(function(success) {
          expect(success).to.be.true;
        })
        .end()
        .findDisplayedByCssSelector('#notificationUI .message')
        .getVisibleText()
        .then(function(msg) {
          expect(msg).to.equal(subscriberGroupsPage.msgs.successfulCreation);
        })
        .end()
        .waitForDeletedByCssSelector('div.modal-backdrop')
        .findDisplayedByCssSelector('#subscriber-groups-table_filter input')
        .click()
        .type(groupName)
        .end()
        // Wait for loading to complete
        .waitForDeletedByCssSelector('#subscriber-groups-table tbody tr:nth-child(2)')
        .end()
        .findByCssSelector('#subscriber-groups-table tbody #row_0 td:first-child')
        .getVisibleText()
        .then(function(text) {
          expect(text).to.equal(groupName);
        })
        .end();
    });

    tdd.test('Deleting a subscriber group', function() {
      return subscriberGroupsPage
        .open()
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#subscriber-groups-table_filter input')
        .click()
        .type(groupName)
        .end()
        // Wait for loading to complete
        .waitForDeletedByCssSelector('#subscriber-groups-table tbody tr:nth-child(2)')
        .end()
        .findByCssSelector('#subscriber-groups-table tbody #row_0 td:first-child')
        .moveMouseTo()
        .getVisibleText()
        .then(function(text) {
          expect(text).to.equal(groupName);
        })
        .end()
        .findById('delete_row_0')
        .click()
        .end()
        .findDisplayedByCssSelector('.modal h4')
        .getVisibleText()
        .then(function(text) {
          expect(text).to.equal('Delete Confirmation');
        })
        .end()
        .findById('confirmOkBtn')
        .click()
        .end();
    });

    tdd.test('Searching for a deleted subscriber, it should not exist', function() {
      return subscriberGroupsPage
        .open()
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#subscriber-groups-table_filter input')
        .click()
        .type(groupName)
        .end()
        .findDisplayedById('subscriber-groups-table_processing')
        .end()
        // Wait for loading to complete
        .findByCssSelector('#subscriber-groups-table_processing[style*="visibility: hidden;"]')
        .end()
        .findByCssSelector('#subscriber-groups-table tbody td:first-child')
        .getVisibleText()
        .then(function(text) {
          expect(text).not.to.equal(groupName);
        })
        .end();
    });
  });
});
