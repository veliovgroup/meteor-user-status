Package.describe({
  name: 'ostrio:user-status',
  version: '1.0.1',
  summary: 'Reactively check user\'s [on|off]line and idle status',
  git: 'https://github.com/VeliovGroup/Meteor-user-status',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.mainModule('client/main.js', 'client');
  api.addFiles('server/main.js', 'server');
  api.use(['accounts-base', 'accounts-password', 'ecmascript'], ['client', 'server']);
  api.use(['session', 'reactive-var', 'tracker'], 'client');
});
