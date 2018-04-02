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
  '../pages/ecommerce.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  EcommercePage
) {
  tdd.suite('Ecommerce - Catalog & Notifications', function() {
    var authPage, ecommercePage;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      ecommercePage = new EcommercePage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Page loads correctly', function() {
      return ecommercePage
        .openCatalogNotifications()
        .findById('sidebar')
        .end()
        .findByCssSelector('a[href="/op-admin/category"]')
          .getVisibleText()
          .then(function(text) {
            expect(text).to.equal('Categories');
          })
        .end();
    });
  });
});
