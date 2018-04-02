/**
 * Holds target inspecific options.
 * Other options are passed directly via the Gruntile.js
 * @author Tyler Van Hoomissen
 */
var SPECS_DIR = '../../../../tests/e2e/specs/';

define({
  // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
  maxConcurrency: 2,
  tunnel: 'NullTunnel',
  loaderOptions: {},
  excludeInstrumentation: /^(?:tests|node_modules)\//,
  bail: false,

  // Functional test suite(s) to execute against each browser once non-functional tests are completed
  functionalSuites: [
    SPECS_DIR + 'auth.spec.js',
    SPECS_DIR + 'csp.account.spec.js',
    SPECS_DIR + 'csp.subscriber.spec.js',
    SPECS_DIR + 'csp.plan.spec.js',
    SPECS_DIR + 'csp.device.spec.js',
    SPECS_DIR + 'users.roles.spec.js',
    SPECS_DIR + 'roles.permissions.spec.js',
    SPECS_DIR + 'profile.spec.js',
    SPECS_DIR + 'feature.spec.js',
    SPECS_DIR + 'iframe.regression.spec.js',
    SPECS_DIR + 'tenant.settings.spec.js',
    SPECS_DIR + 'partner.settings.spec.js',
    SPECS_DIR + 'provision.subscribers.regression.spec.js',
    SPECS_DIR + 'ecommerce.catalog.spec.js',
    SPECS_DIR + 'ecommerce.notification.bodies.spec.js',
    SPECS_DIR + 'subscriber.groups.spec.js',
    SPECS_DIR + 'ecommerce.policies.spec.js',
    SPECS_DIR + 'network.groups.spec.js',
    SPECS_DIR + 'advanced.voice.policy.spec.js',
    SPECS_DIR + 'certificates.spec.js',
    SPECS_DIR + 'myfav.behavior.policy.spec.js',
  ]
});
