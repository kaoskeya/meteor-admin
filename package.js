Package.describe({
  name: 'kaoskeya:admin',
  version: '0.2.4_5',
  summary: 'Simple autoform based admin that integrates with your bootstrap design.',
  git: 'https://github.com/kaoskeya/meteor-admin.git',
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
      'chrismbeckett:toastr@2.1.0',
      'sacha:spin@2.0.4',
      'reywood:publish-composite@1.3.5',
      'iron:dynamic-template@1.0.7',
      'tmeasday:publish-counts@0.3.9'
    ],
    ['client','server']
  );

  api.use(['templating'], 'client');

  api.addFiles('kaoskeya:admin.js');

  api.add_files([
    'client/k_admin.html',
    'client/k_admin.js',
    'client/k_admin.css'
    ], 'client');

  api.add_files([
    'server/publish.js',
    'server/methods.js'
    ], 'server');

  api.export('kAdmin'  ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('kaoskeya:admin');
  api.addFiles('kaoskeya:admin-tests.js');
});
