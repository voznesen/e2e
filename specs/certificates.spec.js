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
  '../pages/certificates.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  AuthPage,
  CertifcatesPage
) {
  tdd.suite('Certificates Management', function() {
    var authPage,
      PO,
      newName,
      certificateCount;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      PO = new CertifcatesPage(this.remote);

      return authPage
        .loginAndSetCurrentPartner()
        .then(function() {
          return PO.open()
          .findByXpath('//simple-data-table/div[@id="certificate-table_wrapper"]/div[contains(@style, "hidden")]')
          .end()
          .findAllByCssSelector('#certificate-table tbody tr')
            .then(function(trs) {
              certificateCount = trs.length;
            })
          .end();
        });
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Upload', function() {
      return PO
        .upload()
        .findByCssSelector('.notification-parent:not(.ng-hide)')
          .findByCssSelector('.message')
            .getVisibleText()
            .then(function(message) {
              expect(message).to.equal('The certificate for E2E Test was added to the Certificate Library.');
            })
          .end()
        .end()
        .findByCssSelector('.notification-parent.ng-hide')
        .end()
        .findAllByCssSelector('#certificate-table tbody tr')
          .then(function(trs) {
            expect(trs.length).to.be.above(certificateCount);
          })
        .end();
    });

    tdd.test('Delete', function() {
      return this.remote
        .findByXpath('//simple-data-table//table/tbody//tr[td/text() = "E2E Test"]')
          .moveMouseTo()
          .findByCssSelector('td:nth-child(5) button')
            .click()
          .end()
        .end()
        .findById('confirmOkBtn')
          .click()
        .end()
        .findByCssSelector('.notification-parent:not(.ng-hide)')
          .findByCssSelector('.message')
            .getVisibleText()
            .then(function(message) {
              expect(message).to.equal('The certificate was deleted from the Certificate Library.');
            })
          .end()
        .end()
        .findByCssSelector('.notification-parent.ng-hide')
        .end()
        .findAllByCssSelector('#certificate-table tbody tr')
          .then(function(trs) {
            expect(trs.length).to.equal(certificateCount);
          })
        .end();
    });
  });
});
