Package.describe({
  name: 'ostrio:user-status',
  version: '0.3.3',
  summary: 'Reactively check user\'s [on|off]line and idle status',
  git: 'https://github.com/VeliovGroup/Meteor-user-status',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0.3.1');
  api.addFiles('client/main.coffee', 'client');
  api.addFiles('server/main.coffee', 'server');
  api.use(['coffeescript', 'accounts-base', 'accounts-password', 'ostrio:jsextensions@0.0.4', 'sha'], ['client', 'server']);
  api.use(['session', 'tracker'], 'client')
});
