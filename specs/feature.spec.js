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
  '../pages/feature.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  FeaturePage
) {
  tdd.suite('Feature', function() {
    var authPage,
      featurePage,
      featureName = helper.getRandomString();

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      featurePage = new FeaturePage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return featurePage.open();
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Creating a new publishable feature', function() {
      return featurePage
        .create('publishable', {
          name: featureName,
          code: featureName,
          description: featureName
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
        .findById('label_featureName')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal(featureName);
          })
        .end()
        .findByCssSelector('input[ng-model="data.feature.featureCode.code"]')
          .getSpecAttribute('value')
          .then(function(value) {
            expect(value).to.equal(featureName);
          })
        .end()
        .findByCssSelector('textarea[ng-model="data.feature.featureCode.description"]')
          .getSpecAttribute('value')
          .then(function(value) {
            expect(value).to.equal(featureName);
          })
        .end();
    });

    tdd.test('Deleting a publishable feature', function() {
      return featurePage
        .open()
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#features-table_filter input')
          .click()
          .type(featureName)
        .end()
        .findDisplayedById('features-table_processing')
        .end()
        // Wait for loading to complete
        .findByCssSelector('#features-table_processing[style*="visibility: hidden;"]')
        .end()
        .findByCssSelector('#row_0 td:first-child')
          .moveMouseTo()
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal(featureName);
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

    tdd.test('Searching for a deleted publishable feature, it should not exist', function() {
      return featurePage
        .open()
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('#features-table_filter input')
          .click()
          .type(featureName)
        .end()
        .findDisplayedById('features-table_processing')
        .end()
        // Wait for loading to complete
        .findByCssSelector('#features-table_processing[style*="visibility: hidden;"]')
        .end()
        .findByCssSelector('#features-table td:first-child')
          .getVisibleText()
          .then(function(text) {
            expect(text).not.to.equal(featureName);
          })
        .end();
    });
  });
});
