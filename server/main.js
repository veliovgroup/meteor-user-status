import { Meteor }   from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

const NOOP = function() {};

Accounts.onLogin((data) => {
  Meteor.users.update({
    _id: data.user._id
  }, {
    $set: {
      connection: data.connection.id,
      'profile.online': true,
      'profile.idle': false,
      'profile.location.ip': data.connection.clientAddress,
      'profile.lastLogin': new Date()
    }
  }, NOOP);
});

Accounts.onLogout((data) => {
  Meteor.users.update({
    _id: data.user._id
  }, {
    $set: {
      connection: data.connection.id,
      'profile.online': false,
      'profile.idle': false,
      'profile.location.ip': data.connection.clientAddress
    }
  }, NOOP);
});

Meteor.onConnection((connection) => {
  const connectionId = connection.id;

  connection.onClose(() => {
    Meteor.users.update({
      connection: connectionId
    }, {
      $set: {
        'profile.online': false,
        'profile.idle': false
      }
    }, NOOP);
  });
});
