Package.describe({
  name: 'ostrio:user-status',
  version: '0.6.0',
  summary: 'Reactively check user\'s [on|off]line and idle status',
  git: 'https://github.com/VeliovGroup/Meteor-user-status',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.mainModule('client/main.coffee', 'client');
  api.addFiles('server/main.coffee', 'server');
  api.use(['coffeescript', 'accounts-base', 'accounts-password', 'ecmascript'], ['client', 'server']);
  api.use('random', 'server');
  api.use(['session', 'reactive-var', 'underscore', 'random', 'tracker'], 'client')
  api.export('UserStatus');
});
