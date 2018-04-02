/**
 * Tenant Settings acceptance tests
 * @author Peter Liang
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../lib/vendor/faker.js',
  '../pages/auth.po.js',
  '../pages/settings.po.js'
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage,
  SettingsPage
) {
  tdd.suite('Tenant Settings', function() {
    var authPage, settingsPage;

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      settingsPage = new SettingsPage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.test('Navigate to tenant settings page', function() {
      return settingsPage
        .openTenantSettings()
        .findAllByCssSelector('#settings-table tbody tr:first-child td')
          .then(function(tds) {
            expect(tds.length).to.be.above(1);
          })
        .end();
    });

    tdd.suite('Pagination links', function() {
      tdd.test('Previous button', function() {
        return settingsPage
          .getPreviousBtnClass()
          .then(function(className) {
            expect(className).to.match(/disabled/);
          });
      });

      tdd.test('Next button', function() {
        // skipping this test since SAAS-21194 increased number of rows in tables, resulting in this test to be invalid
        this.skip();

        var firstSettingName;

        return settingsPage
          .getFirstSettingName()
          .then(function(name) {
            firstSettingName = name;
          })
          .then(function() {
            return settingsPage.clickNextButton();
          })
          .then(function() {
            return settingsPage
              .getFirstSettingName()
              .then(function(name) {
                expect(name).not.to.equal(firstSettingName);
              });
          })
          .then(function() {
            return settingsPage.clickPrevButton();
          })
          .then(function() {
            return settingsPage
              .getFirstSettingName()
              .then(function(name) {
                expect(name).to.equal(firstSettingName);
              });
          });
      });

      tdd.test('Discrete page links', function() {
        return settingsPage
          .clickPageNumberTwo()
          .findByCssSelector('.dataTables_paginate li.active a')
            .getVisibleText()
            .then(function(a) {
              expect(a).to.equal('1');
            })
          .end()
          .then(function() {
            return settingsPage.clickPageNumberOne();
          });
      });
    });

    tdd.suite('Filter table', function() {
      tdd.test('Enter filter term', function() {
        var firstSettingName = 'test';

        // return this.remote
        return settingsPage
          .getFirstSettingName()
          .then(function(name) {
            firstSettingName = name;
          })
          .end()
          .then(function() {
            return settingsPage.search(firstSettingName);
          })
          // takes a while for the filter to complete and redraw the table
          .findByXpath('//div[contains(@class, "dataTables-footer")]/*[contains(., "filtered from")]')
          .end()
          .findAllByCssSelector('#settings-table tbody tr')
            .then(function(tr) {
              expect(tr.length).to.equal(1);
            })
          .end();
      });
    });
  });
});
