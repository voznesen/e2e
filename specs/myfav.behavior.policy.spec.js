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
  '../pages/myfav.behavior.policy.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  MyFavBehaviorPolicyPage
) {
  tdd.suite('MyFav Behavior Policy', function() {
    var authPage,
      PO;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      PO = new MyFavBehaviorPolicyPage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return PO.open()
          .findByXpath('//simple-data-table/div[@id="policies-table_wrapper"]/div[contains(@style, "hidden")]')
          .end();
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Edit Modal', function() {
      return this.remote
        .findByXpath('//simple-data-table//table/tbody//tr[td/text() = "E2E Test DO NOT DELETE"]')
          .moveMouseTo()
          .findByCssSelector('td:nth-child(4) button')
            .click()
          .end()
        .end()
        .findById('confirmAction_btn')
          .getAttribute('disabled')
          .then(function(attr) {
            expect(attr).to.equal('disabled');
          })
        .end()
        .findById('toggleBtn_locked')
          .click()
        .end()
        .findById('allowable_Phone_Number')
          .clearValue()
        .end()
        .findById('confirmAction_btn')
          .getAttribute('disabled')
          .then(function(attr) {
            expect(attr).to.equal('disabled');
          })
        .end()
        .findById('allowable_Phone_Number')
          .type('*')
        .end()
        .findById('confirmAction_btn')
          .click()
        .end()
        .findById('regex-error-msg')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal('Invalid regular expression');
          })
        .end()
        .findById('allowable_Phone_Number')
          .clearValue()
          .type('.*')
        .end()
        .findById('input-MyFav_Name')
          .click()
        .end()
        .findById('confirmAction_btn')
          .getAttribute('disabled')
          .then(function(attr) {
            expect(attr).be.null;
          })
        .end()
        .findById('confirmAction_btn')
          .click()
        .end()
        .findByCssSelector('#notificationUI:not(.ng-hide)')
          .findByCssSelector('.message')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.equal('E2E Test DO NOT DELETE Behavior Policy has been updated.');
            })
          .end()
        .end();
    });
  });
});
