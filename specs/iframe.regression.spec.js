/**
 * @see SAAS-11965
 * @author Tyler Van Hoomissen
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../pages/auth.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage
) {
  tdd.suite('Iframe regression', function() {
    var authPage;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Should load the portal in an iframe on same origin', function() {
      return this.remote
        .get(helper.getHostUrl() + '/iframetest.php?iframetest=' + helper.getHostUrl())
        .setFindTimeout(helper.getFindTimeout())
        .findAllByTagName('iframe')
          .then(function(frames) {
            return this.parent
              .switchToFrame(frames[0])
              .execute(function() {
                return window.app;
              })
              .then(function(appObject) {
                expect(appObject).to.be.ok;
                expect(appObject.name).to.equal('App');
              });
          })
        .end();
    });

    tdd.test('Should not load the protal in an iframe on a different origin', function() {
      var httpsUrl = helper
        .getHostUrl()
        .replace('http', 'https');

      return this.remote
        .get(helper.getHostUrl() + '/iframetest.php?iframetest=' + httpsUrl)
        .setFindTimeout(helper.getFindTimeout())
        .findAllByTagName('iframe')
          .then(function(frames) {
            return this.parent
              .switchToFrame(frames[0])
              .execute(function() {
                return window.app;
              })
              .then(function(appObject) {
                expect(appObject).not.to.be.ok;
              });
          })
        .end();
    });
  });
});
