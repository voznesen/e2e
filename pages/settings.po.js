/**
 * Partner and tenant settings
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function SettingsPage(remote) {
    this.remote = remote;

    this.msgs = {};

    /**
     * @return {object} promise
     */
    this.openTenantSettings = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findByClassName('glyphicon-cog')
          .click()
        .end()
        .findByLinkText('Tenant Settings')
          .click()
        .end()
        .findByXpath('//table/tbody/tr[position()=2]')
        .end();
    };

    /**
     * @return {object} promise
     */
    this.openPartnerSettings = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findByClassName('glyphicon-cog')
          .click()
        .end()
        .findByLinkText('Partner Settings')
          .click()
        .end()
        .findByXpath('//table/tbody/tr[position()=2]')
        .end();
    };

    /**
     * @return {object} The class name
     */
    this.getPreviousBtnClass = function() {
      return this.remote
        .findByXpath('//a[@id = "btn-dataTable_prev"]/ancestor::li[1]')
        .then(function(li) {
          return li.getAttribute('class');
        })
        .then(function(className) {
          return className;
        });
    };

    this.getNextBtnClass = function() {
      return this.remote
        .findByXpath('//a[@id = "btn-dataTable_next"]/ancestor::li[1]')
        .then(function(li) {
          return li.getAttribute('class');
        })
        .then(function(className) {
          return className;
        });
    };

    /**
     * @return {object} The name of the first row
     */
    this.getFirstSettingName = function() {
      return this.remote
        .findByXpath('//table/tbody/tr[position()=1]/td')
          .getVisibleText()
          .then(function(name) {
            return name;
          });
    };

    /**
     * Next button of the table
     * @return {object} promise
     */
    this.clickNextButton = function() {
      return this.remote
        .findById('btn-dataTable_next')
          .click()
        .end();
    };

    /**
     * Prev button of the table
     * @return {object} promise
     */
    this.clickPrevButton = function() {
      return this.remote
        .findById('btn-dataTable_prev')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickPageNumberOne = function() {
      return this.remote
        .findByCssSelector('.dataTables_paginate li:nth-child(2) a')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickPageNumberTwo = function() {
      return this.remote
        .findByCssSelector('.dataTables_paginate li:nth-child(3) a')
          .click()
        .end();
    };

    /**
     * @param {string} value
     * @return {object} promise
     */
    this.search = function(value) {
      return this.remote
        .findByCssSelector('#settings-table_filter input')
          .click()
          .clearValue()
          .type(value)
        .end();
    };
  }

  return SettingsPage;
});
