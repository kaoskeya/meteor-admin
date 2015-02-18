Package.describe({
  name: 'kaoskeya:admin',
  version: '0.1.2',
  // Brief, one-line summary of the package.
  summary: 'Simple admin panel that integrates with your design.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/kaoskeya/meteor-admin.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');

  api.use(
    [
      'underscore',
      'reactive-var',
      'reactive-dict',
      'jquery',
      'aldeed:delete-button@1.0.0',
      'chrismbeckett:toastr@2.1.0',
      'sacha:spin@2.0.4',
      'reywood:publish-composite@1.3.5'
    ],
    ['client','server']
  );

  api.use(['templating'], 'client');

  api.addFiles('kaoskeya:admin.js');

  api.add_files([
    'client/k_admin.html',
    'client/k_admin.js',
    'client/k_admin.css',
    ], 'client');

  api.add_files([
    'server/publish.js',
    ], 'server');

  api.export('kAdmin', ['client', 'server']);

});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('kaoskeya:admin');
  api.addFiles('kaoskeya:admin-tests.js');
});
