/**
 * Provision Subscriber Regression Test
 * SAAS-16727
 * @author Peter Liang
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../lib/vendor/faker.js',
  '../pages/auth.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage
) {
  tdd.suite('Provision Subscribers', function() {
    var authPage;
    var mdn;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      mdn = '9997465927';
      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Navigate to provision subscriber page', function() {
      return this.remote
        .get(helper.getHostUrl())
        .findDisplayedById('navigLinkToCloudAdmin')
          .click()
        .end()
        .findDisplayedById('navigLinkToProvision')
          .click()
        .end()
        .findDisplayedById('cloud-admin-provision-subscriber')
        .end()
        .findDisplayedById('csp-search-input')
        .end()
        .findDisplayedById('showProvisionSubscriberForm')
        .end();
    });

    tdd.test('Provision Subscriber workflow', function() {
      return this.remote
        .findDisplayedById('showProvisionSubscriberForm')
          .click()
        .end()
        .findByCssSelector('input[ng-model="inputs.phoneNumber"]')
          .clearValue()
          .type(mdn)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end()
        .findDisplayedByCssSelector('form[name="provisionSubscriberForm"] div li label')
        .end()
        .findAllByCssSelector('form[name="provisionSubscriberForm"] li')
          .then(function(lis) {
            expect(lis.length).to.be.above(1);
          })
        .end();
    });
  });
});
