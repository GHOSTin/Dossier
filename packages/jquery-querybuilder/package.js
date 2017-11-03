Package.describe({
  name: 'ghostin:jquery-querybuilder',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null,
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('ecmascript');
  api.mainModule('jquery-querybuilder.js');
  api.addFiles('query-builder.default.css', 'client');
  api.addFiles('query-builder.standalone.js', 'client');
  api.addFiles('i18n/query-builder.ru.js', 'client');
  api.export('QueryBuilder', 'client');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('ghostin:jquery-querybuilder');
  api.mainModule('jquery-querybuilder-tests.js');
});

Npm.depends({
    interactjs : '1.2.9',
});
