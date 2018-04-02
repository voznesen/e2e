/**
 * @author Tyler Van Hoomissen
 */
define([
  'intern!tdd',
  'intern/chai!expect',
  'require',
  'intern',
  '../lib/helper.js',
  '../lib/vendor/faker.js',
  '../pages/auth.po.js',
  '../pages/csp.po.js',
  '../pages/csp.account.po.js',
  '../pages/csp.plan.po.js',
  '../pages/csp.subscriber.po.js',
], function(
  tdd,
  expect,
  require,
  intern,
  helper,
  faker,
  AuthPage,
  CSPPage,
  CSPAccountPage,
  CSPPlanPage,
  CSPSubscriberPage
) {
  tdd.suite('CSP Account View', function() {
    var authPage,
      cspPage,
      cspAccountPage,
      cspPlanPage,
      cspSubscriberPage,
      dummyAccountEmail,
      dummySubscriber = {
        snid: null,
        phoneNumber: null
      };

    tdd.before(function() {
      authPage = new AuthPage(this.remote);
      cspPage = new CSPPage(this.remote);
      cspAccountPage = new CSPAccountPage(this.remote);
      cspPlanPage = new CSPPlanPage(this.remote);
      cspSubscriberPage = new CSPSubscriberPage(this.remote);

      return authPage.loginAndSetCurrentPartner();
    });

    tdd.after(function() {
      return authPage.logout();
    });

    tdd.afterEach(function(test) {
      helper.reportFailure(this.remote, test);
    });

    tdd.suite('Devtools', function() {
      tdd.test('Create a dummy account for tests', function() {
        return cspPage.createAccount()
          .then(function(result) {
            expect(result.success).to.be.true;
            expect(result.emailAddress).not.to.be.null;
            dummyAccountEmail = result.emailAddress;
          })
          .sleep(5000);
      });

      tdd.test('Create a dummy subscriber for tests', function() {
        return cspPage.createSubscriber()
          .then(function(result) {
            expect(result.success).to.be.true;
            expect(result.snid).not.to.be.null;
            dummySubscriber.snid = result.snid;
          });
      });
    });

    tdd.suite('Search', function() {
      tdd.test('Account lookup with correct security question', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('editable-email-trigger')
            .getAttribute('eea-email')
            .then(function(text) {
              expect(text).to.equal(dummyAccountEmail);
            })
          .end();
      });

      tdd.test('Account lookup with bad security question', function() {
        return cspPage
          .open()
          .then(function() {
            return cspPage.searchAndEnterValidSecurityQuestion(
              dummyAccountEmail,
              cspAccountPage.badSecurityAnswer
            );
          })
          .then(function() {
            return cspAccountPage
              .getSecurityQuestionAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(cspAccountPage.msgs.badSecurityAnswer);
              });
          });
      });

      tdd.test('Subscriber lookup without security question', function() {
        return cspPage
          .openSubscriber(dummySubscriber.snid, true)
          .findById('csp-subscriber-id')
            .getVisibleText()
            .then(function(snid) {
              expect(snid).to.equal(dummySubscriber.snid);
            })
          .end()
          // Save the phone number for later tests
          .findByCssSelector('h4.phone-number')
            .getVisibleText()
            .then(function(text) {
              dummySubscriber.phoneNumber = text.replace(/\D+/, '');
              expect(dummySubscriber.phoneNumber).not.to.be.null;
            })
          .end();
      });
    });

    tdd.suite('Header', function() {
      tdd.suite('Account actions', function() {
        tdd.test('Join subscriber to account', function() {
          return cspPage
            .openAccount(dummyAccountEmail)
            .then(function() {
              return cspAccountPage.clickJoinSubscriber();
            })
            .findById('csp-join-sub-mdn')
              .click()
              .clearValue()
              .type(dummySubscriber.phoneNumber)
            .end()
            .findByCssSelector('.modal-footer button.btn-primary')
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(text) {
                  expect(text).to.equal(dummySubscriber.phoneNumber + ' has been joined to this account.');
                });
            });
            // Make sure the subscriber loads in the subs table
            // Disabling this part of the test due to race conditions that make it unstable in QA env
            // .findByXpath('//table[@id="subs-table"]/tbody/tr/td[contains(.,"'+dummySubscriber.phoneNumber+'")]')
            // .end();
        });

        // @TODO CSP user creation isn't always attaching a card. This needs
        // to be validated before this test can be implemented.
        // tdd.test('Manage credit cards', function() {
        //   return cspPage
        //     .open()
        //     .then(function() {
        //       return cspPage.searchAndEnterValidSecurityQuestion(
        //         dummyAccountEmail,
        //         cspAccountPage.defaultSecurityAnswer
        //       );
        //     })
        //     // Give it some time for CSP to search for the account
        //     .waitForDeletedByCssSelector('div.modal-backdrop')
        //     .findById('csp-account-details')
        //     .end()
        //     .then(function() {
        //       return cspAccountPage.clickAccountManageCreditCards();
        //     })
        //     .findByCssSelector('td.csr-card-info > h3')
        //       .getVisibleText()
        //       .then(function(text) {
        //         expect(text).to.equal('41111111****1111');
        //       });
        // });

        tdd.test('Apply account credit', function() {
          var creditAmount = 10.00,
            originalBalance = null;

          return cspPage
            .openAccount(dummyAccountEmail)
            .then(function() {
              return cspAccountPage.getCurrentAccountBalance()
                .then(function(balance) {
                  originalBalance = balance;
                });
            })
            .then(function() {
              return cspAccountPage.clickApplyAccountCredit();
            })
            .findDisplayedByCssSelector('#apply-account-credit')
              .findByCssSelector('input[ng-model="account.creditAmount"]')
                .click()
                .clearValue()
                .type(String(creditAmount))
              .end()
              .findByCssSelector('select[ng-model="account.creditReason"] > option[value="0"]')
                .click()
              .end()
            .end()
            .findByCssSelector('button.btn-primary[ng-click="ok()"]')
              .getAttribute('disabled')
              .then(function(value) {
                expect(value).to.be.null;
              })
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(alertMsg) {
                  var msg = 'Successfully credited $'+creditAmount.toFixed(2)+' to account balance.';
                  msg += ' New account balance is $'+(originalBalance + creditAmount).toFixed(2)+'.';
                  expect(alertMsg.replace(/[$,.]/g, '')).to.equal(msg.replace(/[$,.]/g, ''));
                });
            })
            .then(function() {
              // Let's make sure the balance updated
              return cspAccountPage.getCurrentAccountBalance()
                .then(function(balance) {
                  expect(balance).to.equal(originalBalance + creditAmount);
                });
            });
        });

        tdd.test('Make purchase with SKU', function() {
          var persistentProduct = {
            SKU: 1500028878,
            name: 'FE Automated Tests - Don’t Delete'
          };

          return cspPage
            .openAccount(dummyAccountEmail)
            .then(function() {
              return cspAccountPage.clickMakePurchaseWithSKU();
            })
            .findByCssSelector('.modal-body')
              .findByCssSelector('input[ng-model="data.sku"]')
                .click()
                .clearValue()
                .type(String(persistentProduct.SKU))
              .end()
            .end()
            .findByCssSelector('.modal-footer button.btn-primary:not(.disabled)')
              .getVisibleText()
              .then(function(txt) {
                expect(txt).to.equal('Search');
              })
              .click()
            .end()
            .findByCssSelector('figure[us-spinner]:not(.visible)')
            .end()
            .findByCssSelector('h6[ng-bind-html="data.productName"]')
              .getVisibleText()
              .then(function(txt) {
                expect(txt).to.equal(persistentProduct.name);
              })
            .end()
            .findByCssSelector('.modal-footer button.btn-primary:not(.disabled)')
              .getVisibleText()
              .then(function(txt) {
                expect(txt).to.equal('Purchase');
              })
              .click()
            .end()
            .waitForDeletedByCssSelector('div.modal-backdrop')
            .then(function() {
              // Check alert message
              return cspPage
                .getAlertMessageText()
                .then(function(alertMsg) {
                  expect(alertMsg).to.equal(cspAccountPage.msgs.successfulSkuPurchase);
                });
            })
            .then(function() {
              return cspPage.openAccount(dummyAccountEmail);
            })
            .findByCssSelector('#csp-plans-usage-tab > a')
              .click()
            .end()
            // Make sure the table is loaded before we look for real records
            .findByCssSelector('#current-plans-usage-table td:not(.dataTables_empty)')
            .end()
            .findByCssSelector('#current-plans-usage-table tbody tr:first-child td:first-child')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.equal(persistentProduct.name);
              })
            .end();
        });

        tdd.test('Add note', function() {
          var noteMessage = faker.lorem.sentences(3);

          return cspPage
            .openAccount(dummyAccountEmail)
            .then(function() {
              return cspAccountPage.clickAccountAddNote();
            })
            .findByCssSelector('.modal-body textarea[ng-model="noteObj.content"]')
              .click()
              .clearValue()
              .type(noteMessage)
            .end()
            .findById('save-btn')
              .click()
            .end()
            .waitForDeletedByCssSelector('div.modal-backdrop')
            .then(function() {
              // Check alert message
              return cspPage
                .getAlertMessageText()
                .then(function(alertMsg) {
                  expect(alertMsg).to.equal(cspAccountPage.msgs.successfulAccountNote);
                });
            })
            .then(function() {
              return cspPage.openAccount(dummyAccountEmail);
            })
            .findByCssSelector('#csp-note-history-tab > a')
              .click()
            .end()
            // Make sure the table is loaded before we look for real records
            .findByCssSelector('#notes-table td:not(.dataTables_empty)')
            .end()
            .findByCssSelector('#notes-table tbody tr:first-child td:last-child')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.not.equal('No data found.');
                expect(text).to.equal(noteMessage);
              })
            .end();
        });

        tdd.test('Reset password', function() {
          return cspPage
            .openAccount(dummyAccountEmail)
            .then(function() {
              return cspAccountPage.clickAccountResetPassword();
            })
            .findByCssSelector('.modal-body p')
              .sleep(1000)
              .getVisibleText()
              .then(function(emailText) {
                expect(emailText).to.match(RegExp(dummyAccountEmail));
              })
            .end()
            .findById('cspSaveBtn')
              .getVisibleText()
              .then(function(buttonText) {
                expect(buttonText).to.equal('Send Notification');
              })
              .click()
            .end()
            .then(function() {
              return cspPage
                .getAlertMessageText()
                .then(function(alertText) {
                  expect(alertText).to.equal(cspAccountPage.msgs.successfulPasswordReset);
                });
            });
        });

        tdd.suite('Subscribers table', function() {
          tdd.test('Clicking a nickname takes you to the subscriber view', function() {
            var phoneNumber;
            return cspPage
              .openAccount(dummyAccountEmail)
              .setFindTimeout(60000) // one minute timeout for this step, really slow
              // Get the TD with the phone number
              .findByCssSelector('#subs-table tbody tr:first-child td:first-child + td')
                .getVisibleText()
                .then(function(text) {
                  expect(text).not.to.be.null;
                  phoneNumber = text;
                })
              .end()
              .findById('csp-sub-0')
                .click()
              .end()
              .findById('csp-subscriber-details')
              .end()
              .then(function() {
                return cspSubscriberPage
                  .getPhoneNumberHeaderText()
                  .then(function(text) {
                    expect(phoneNumber).to.equal(text.replace(/\D+/, ''));
                  });
              });
          });
        });

        tdd.suite('Suspend/resume account', function() {
          tdd.test('Suspend', function() {
            return cspPage
              .openAccount(dummyAccountEmail)
              .then(function() {
                return cspAccountPage.clickAccountSuspendResume();
              })
              .findByCssSelector('.modal-body')
                .findAllByCssSelector('input[ng-model="reason.isSelected"]')
                  .click()
                .end()
              .end()
              .findByCssSelector('.modal-footer button.btn-primary:not(.disabled)')
                .getVisibleText()
                .then(function(buttonText) {
                  expect(buttonText).to.equal('Suspend Account');
                })
                .click()
              .end()
              .then(function() {
                return cspPage
                  .getAlertMessageText()
                  .then(function(alertText) {
                    expect(alertText).to.equal(cspAccountPage.msgs.successfulSuspend);
                  });
              })
              .then(function() {
                return cspAccountPage
                  .getAccountStatusText()
                  .then(function(statusText) {
                    expect(statusText).to.equal('Suspended');
                  });
              })
              .then(function() {
                return cspAccountPage
                  .getAccountSuspensionReasons()
                  .then(function(reasons) {
                    expect(reasons.length).to.equal(3);
                  });
              })
              .then(function() {
                // Help give resume time to have correct data
                return this.parent.sleep(30000);
              });
          });

          /**
           * @TODO Figure out a way for this test to not skip due to
           * the backend handling the suspension async
           * @see SAAS-14339
           */
          tdd.test('Resume', function() {
            this.skip();

            return cspPage
              .openAccount(dummyAccountEmail)
              .then(function() {
                return cspAccountPage
                  .getAccountStatusText()
                  .then(function(statusText) {
                    if (statusText != 'Suspended') {
                      this.skip("Race condition: suspended account hasn't suspended yet so test would fail");
                    }
                  }.bind(this));
              }.bind(this))
              .then(function() {
                return cspAccountPage.clickAccountSuspendResume();
              })
              .findByCssSelector('.modal-body .reasons-area > p')
                .getVisibleText()
                .then(function(text) {
                  expect(text).to.equal('Account Status: Suspended');
                })
              .end()
              .findByCssSelector('.modal-body')
                .findAllByCssSelector('input[ng-model="reason.isSelected"]')
                  .click()
                .end()
              .end()
              .findDisplayedByCssSelector('.modal-footer button[ng-if="isStep(1)"]:not(.disabled)')
                .getVisibleText()
                .then(function(buttonText) {
                  expect(buttonText).to.equal('Resume Account');
                })
                .click()
              .end()
              .findDisplayedByCssSelector('.modal-footer button[ng-if="isStep(2)"]:not(.disabled)')
                .getVisibleText()
                .then(function(buttonText) {
                  expect(buttonText).to.equal('Continue');
                })
                .click()
              .end()
              .findDisplayedByCssSelector('.modal-footer button[ng-if="isStep(3)"]:not(.disabled)')
                .getVisibleText()
                .then(function(buttonText) {
                  expect(buttonText).to.equal('Place Order');
                })
                .click()
              .end()
              .then(function() {
                return cspPage
                  .getAlertMessageText()
                  .then(function(alertText) {
                    expect(alertText).to.equal(cspAccountPage.msgs.successfulResume);
                  });
              })
              .then(function() {
                return cspAccountPage
                  .getAccountStatusText()
                  .then(function(statusText) {
                    expect(statusText).to.equal('Active');
                  });
              });
          });
        });
      });

      tdd.test('All data is present', function() {
        return cspPage
          .openAccount(dummyAccountEmail)
          .findByCssSelector('header.account-details')
            .findById('editable-name')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.equal('Test Functional');
              })
            .end()
            .findById('editable-email')
              .getVisibleText()
              .then(function(text) {
                expect(text).to.equal(dummyAccountEmail);
              })
            .end()
            .findById('editable-address')
              .getVisibleText()
              .then(function(text) {
                expect(text, '123 W Santa Clara St,\nSan Jose, CA 95113 US');
              })
            .end()
            .findById('qualution-id')
              .getVisibleText()
              .then(function(text) {
                expect(text.length > 0).to.be.true;
              })
            .end()
          .end();
      });

      tdd.test('Can edit first and last name', function() {
        var newFirst = helper.getRandomString(),
          newLast = helper.getRandomString();

        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('editable-name-trigger')
            .click()
          .end()
          .findByCssSelector('input[ng-model="first"]')
            .click()
            .clearValue()
            .type(newFirst)
          .end()
          .findByCssSelector('input[ng-model="last"]')
            .click()
            .clearValue()
            .type(newLast)
          .end()
          .then(function() {
            return cspAccountPage.clickEditableSubmit('name');
          })
          .findByCssSelector('figure[us-spinner]:not(.visible)')
          .end()
          .findByXpath('//span[@id="editable-name"][contains(., "'+newFirst+'")][contains(., "'+newLast+'")]')
          .end()
          .findById('editable-name')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.equal(newFirst + ' ' + newLast);
            })
          .end();
      });

      tdd.test('Can edit email', function() {
        // temporarily skipping this test, because it just fails and it isn't our code -Moe
        this.skip();

        var newEmail = helper.getRandomEmail();

        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('editable-email-trigger')
            .click()
          .end()
          .findByCssSelector('input[ng-model="email"]')
            .click()
            .clearValue()
            .type(newEmail)
          .end()
          .then(function() {
            return cspAccountPage.clickEditableSubmit('email');
          })
          .findByCssSelector('figure[us-spinner]:not(.visible)')
          .end()
          .findByXpath('//b[@id="editable-email" and contains(., "'+newEmail+'")]')
          .end()
          .findById('editable-email')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.equal(newEmail);
            })
          .end()
          .then(function() {
            // Set the new email as the new dummy email
            dummyAccountEmail = newEmail;
          })
          // Give update email BE some time to breathe
          .sleep(5000);
      });

      tdd.test('Can edit address', function() {
        var newAddress = {
          line1: '701 Laurel St.',
          line2: '',
          city: 'Menlo Park',
          zip: '94025',
          state: 6
        };

        return cspPage
          .openAccount(dummyAccountEmail)
          .findById('editable-address-trigger')
            .click()
          .end()
          .findByCssSelector('input[ng-model="obj.addressLine1"]')
            .click()
            .clearValue()
            .type(newAddress.line1)
          .end()
          .findByCssSelector('input[ng-model="obj.addressLine2"]')
            .click()
            .clearValue()
            .type(newAddress.line2)
          .end()
          .findByCssSelector('input[ng-model="obj.city"]')
            .click()
            .clearValue()
            .type(newAddress.city)
          .end()
            .findByCssSelector('input[ng-model="obj.postalCode"]')
            .click()
            .clearValue()
            .type(newAddress.zip)
          .end()
          .findById('input_state')
            .click()
          .end()
          .findByCssSelector('select[ng-model="state"] > option:nth-child(6)')
            .click()
          .end()
          .findByCssSelector('select[ng-model="country"]')
            .getAttribute('disabled')
            .then(function(text) {
              expect(text).to.equal('disabled');
            })
          .end()
          .then(function() {
            return cspAccountPage.clickEditableSubmit('address');
          })
          .findByCssSelector('figure[us-spinner]:not(.visible)')
          .end()
          .findByXpath('//b[@id="editable-address" and contains(., "'+ newAddress.line1 +'")]')
            .getVisibleText()
            .then(function(address) {
              expect(address).to.equal(newAddress.line1 + ', \n' + newAddress.city + ', CA ' + newAddress.zip + ' US');
            })
          .end();
      });
    });

    tdd.suite('Status area', function() {
      tdd.test('Account notification language', function() {
        var originalLanguage;

        return cspPage
          .openAccount(dummyAccountEmail)
          // .findByCssSelector('aside.status-area .status')
          //   .getVisibleText()
          //   .then(function(text) {
          //     expect(text).to.equal("Account Status\nActive");
          //   })
          // .end()
          .findByCssSelector('aside.status-area a.notification-language')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.equal('English');
              originalLanguage = text;
            })
            .click()
          .end()
          .findByCssSelector('.modal-body select[ng-model="data.selected"] > option[value="4"]')
            .click()
          .end()
          .findById('cspSaveBtn')
            .click()
          .end()
          .then(function() {
            return cspPage
              .getAlertMessageText()
              .then(function(alertMsg) {
                expect(alertMsg).to.equal(cspAccountPage.msgs.successfulNotifLangUpdate);
              });
          })
          .findByCssSelector('aside.status-area a.notification-language')
            .getVisibleText()
            .then(function(text) {
              expect(text).to.not.equal(originalLanguage);
              expect(text).to.equal('Français');
            })
          .end();
      });
    });

    tdd.suite('Data area', function() {
      tdd.suite('Plans and Usage table', function() {
        tdd.test('Clicking a plan name takes you to the plan view', function() {
          var planName;
          return cspPage
            .openAccount(dummyAccountEmail)
            .findById('csp-plans-usage-tab')
              .click()
            .end()
            // This selector ensure we've got a plan and not a fee
            .findByCssSelector('#current-plans-usage-table tbody tr td:first-child a[ui-sref*="account.plan"]')
              .getVisibleText()
              .then(function(text) {
                expect(text).not.to.be.null;
                planName = text;
              })
              .click()
            .end()
            .findById('csp-plan-details')
            .end()
            .then(function() {
              return cspPlanPage
                .getPlanNameHeaderText()
                .then(function(text) {
                  if (planName == '-') {
                    expect(text).to.equal('(ID)');
                  } else {
                    expect(text).to.equal(planName + ' (ID)');
                  }
                });
            });
        });

        tdd.test('Clicking a plan cycle takes you to the plan view', function() {
          var planName, planCycle;

          return cspPage
            .openAccount(dummyAccountEmail)
            .findById('csp-plans-usage-tab')
              .click()
            .end()
            // This selector ensure we've got a plan and not a fee
            .findByCssSelector('#current-plans-usage-table tbody tr td:first-child a[ui-sref*="account.plan"]')
              .getVisibleText()
              .then(function(text) {
                expect(text).not.to.be.null;
                planName = text;
              })
            .end()
            // This selector ensure we've got a plan and not a fee
            .findByCssSelector('#current-plans-usage-table tbody tr td:nth-child(2) a[ui-sref*="account.plan"]')
              .getVisibleText()
              .then(function(text) {
                expect(text).not.to.be.null;
                planCycle = text;
              })
              .click()
            .end()
            .findById('csp-plan-details')
            .end()
            .then(function() {
              return cspPlanPage
                .getPlanNameHeaderText()
                .then(function(text) {
                  if (planName == '-') {
                    expect(text).to.equal('(ID)');
                  } else {
                    expect(text).to.equal(planName + ' (ID)');
                  }
                });
            })
            .then(function() {
              return cspPlanPage
                .getCurrentCycleText()
                .then(function(text) {
                  expect(text).to.equal('1 (min. 1 - max. 5)');
                });
            });
        });
      });

      tdd.suite('Cash Balance History table', function() {
        tdd.test('Clicking an invoice transaction id opens up the invoice details modal', function() {
          var transactionId;

          return cspPage
            .openAccount(dummyAccountEmail)
            .findById('csp-billing-tab')
              .click()
            .end()
            .findByCssSelector('#billing-table tbody tr:first-child td:nth-child(2) a')
              .getVisibleText()
              .then(function(id) {
                expect(id).not.to.be.null;
                transactionId = id;
              })
              .click()
            .end()
            .findDisplayedByCssSelector('.modal-header h4')
              .getVisibleText()
              .then(function(transactionString) {
                expect(transactionString).not.to.be.null;
                expect(transactionString.replace(/\D+/, '')).to.equal(transactionId);
              })
            .end();
        });

        tdd.test('Clicking an invoice amount opens up the invoice details modal', function() {
          var transactionId;

          return cspPage
            .openAccount(dummyAccountEmail)
            .findById('csp-billing-tab')
              .click()
            .end()
            .findByCssSelector('#billing-table tbody tr:first-child td:nth-child(2) a')
              .getVisibleText()
              .then(function(id) {
                expect(id).not.to.be.null;
                transactionId = id;
              })
            .end()
            .findByCssSelector('#billing-table tbody tr:first-child td:nth-child(7) a')
              .click()
            .end()
            .findDisplayedByCssSelector('.modal-header h4')
              .getVisibleText()
              .then(function(transactionString) {
                expect(transactionString).not.to.be.null;
                expect(transactionString.replace(/\D+/, '')).to.equal(transactionId);
              })
            .end();
        });

        // @TODO We need the account creation to provide
        // refundable stransactions before we can work on this.
        tdd.test('Refunding', function() {
          this.skip('Pending implementation');
        });
      });

      tdd.suite('Change History table', function() {
        tdd.test('Data exists', function() {
          return cspPage
            .openAccount(dummyAccountEmail)
            .findById('csp-change-tab')
              .click()
            .end()
            // Make sure the table is loaded before we look for real records
            .findByCssSelector('#change-table td:not(.dataTables_empty)')
            .end()
            .findAllByCssSelector('#change-table tbody td')
            .then(function(tds) {
              expect(tds.length).to.be.above(1);
            });
        });
      });

      tdd.suite('Note History table', function() {
        tdd.test('Data exists', function() {
          return cspPage
            .openAccount(dummyAccountEmail)
            .findById('csp-note-history-tab')
              .click()
            .end()
            // Make sure the table is loaded before we look for real records
            .findByCssSelector('#notes-table td:not(.dataTables_empty)')
            .end()
            .findAllByCssSelector('#notes-table tbody td')
            .then(function(tds) {
              expect(tds.length).to.be.above(1);
            });
        });
      });
    });

    tdd.test('Terminate account', function() {
      return cspPage
        .destroyAccount(dummyAccountEmail)
        .then(function(success) {
          expect(success).to.be.true;
        });
    });
  });
});