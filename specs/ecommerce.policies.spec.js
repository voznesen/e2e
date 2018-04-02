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
  '../pages/ecommerce.policies.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  EcommercePoliciesPage
) {
  tdd.suite('Feature', function() {
    var authPage,
      ecommercePoliciesPage,
      policyName = helper.getRandomString();

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      ecommercePoliciesPage = new EcommercePoliciesPage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return ecommercePoliciesPage.open();
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Creating a new eCommerce Policy', function() {
      return ecommercePoliciesPage
        .waitForTableLoading()
        .then(function() {
          return ecommercePoliciesPage
            .create('voice', {
              name: policyName,
              description: policyName
            });
        })
        .then(function(success) {
          expect(success).to.be.true;
        })
        .findById('label_featureState')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal('Draft');
          })
        .end()
        .findByCssSelector('service-policy')
        .end()
        .findById('label_policyName')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal(policyName);
          })
        .end()
        .findByCssSelector('textarea[ng-model="data.feature.featureCode.description"]')
          .getSpecAttribute('value')
          .then(function(value) {
            expect(value).to.equal(policyName);
          })
        .end();
    });

    tdd.test('Deleting a eCommerce Policy', function() {
      return ecommercePoliciesPage
        .open()
        .then(function() {
          ecommercePoliciesPage.waitForTableLoading();
        })
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#features-table_filter input')
          .click()
          .type(policyName)
        .end()
        .findDisplayedById('features-table_processing')
        .end()
        .then(function() {
          return ecommercePoliciesPage.waitForTableLoading();
        })
        .findByCssSelector('#row_0 td:first-child')
          .moveMouseTo()
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal(policyName);
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

    tdd.test('Searching for a deleted eCommerce Policy, it should not exist', function() {
      return ecommercePoliciesPage
        .open()
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#features-table_filter input')
          .click()
          .type(policyName)
        .end()
        .findDisplayedById('features-table_processing')
        .end()
        .then(function() {
          return ecommercePoliciesPage.waitForTableLoading();
        })
        .findByCssSelector('#features-table td:first-child')
          .getVisibleText()
          .then(function(text) {
            expect(text).not.to.equal(policyName);
          })
        .end();
    });
  });
});
