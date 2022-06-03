Package.describe({
  name: 'ostrio:user-status',
  version: '2.0.0',
  summary: 'Get user\'s online, offline, and idle statuses',
  git: 'https://github.com/veliovgroup/Meteor-user-status',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4');
  api.mainModule('client/main.js', 'client');
  api.mainModule('server/main.js', 'server');
  api.use(['ecmascript', 'check'], ['server', 'client']);
  api.use(['reactive-var', 'tracker'], 'client');
});
