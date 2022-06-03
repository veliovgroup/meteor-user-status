import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
const noop = function noop () {};
let _accounts;

class UserStatus {
  constructor() {
    _accounts = (Package && Package['accounts-base'] && Package['accounts-base'].Accounts) ? Package['accounts-base'].Accounts : undefined;

    Meteor.methods({
      'user-status.update'(online, idle) {
        check(online, Boolean);
        check(idle, Boolean);

        if (!this.userId) {
          return false;
        }

        const user = Meteor.users.findOne({ _id: this.userId });
        if (user.profile.status?.online !== online || user.profile.status?.idle !== idle) {
          Meteor.users?.update?.({
            _id: this.userId
          }, {
            $set: {
              connection: this.connection.id,
              'profile.status.online': online,
              'profile.status.idle': idle,
              'profile.status.lastSeen': new Date()
            }
          }, noop);
        }

        return true;
      }
    });

    this.start();
  }
  start() {
    if (_accounts) {
      this.onLogin = _accounts.onLogin((data) => {
        Meteor.users?.update?.({
          _id: data.user._id
        }, {
          $set: {
            connection: data.connection.id,
            'profile.status.online': true,
            'profile.status.idle': false,
            'profile.status.lastLogin': new Date(),
            'profile.status.lastSeen': new Date()
          }
        }, noop);
      });

      this.onLogout = _accounts.onLogout((data) => {
        if (data.user) {
          Meteor.users?.update?.({
            _id: data.user._id
          }, {
            $set: {
              connection: data.connection.id,
              'profile.status.online': false,
              'profile.status.idle': false,
              'profile.status.lastSeen': new Date()
            }
          }, noop);
        } else if (data.connection?.id) {
          Meteor.users?.update?.({
            connection: data.connection.id
          }, {
            $set: {
              'profile.status.online': false,
              'profile.status.idle': false,
              'profile.status.lastSeen': new Date()
            }
          }, noop);
        }
      });

      this.onConnection = Meteor.onConnection((connection) => {
        const connectionId = connection.id;

        connection.onClose(() => {
          Meteor.setTimeout(() => {
            // USE TIMEOUT HERE TO AVOID SETTING idle STATUS
            // WHICH IS CALLED ON SOME BROWSERS VIA visibility API
            // UPON CLOSING BROWSER TAB OR WINDOW
            Meteor.users?.update?.({
              connection: connectionId
            }, {
              $set: {
                'profile.status.online': false,
                'profile.status.idle': false,
                'profile.status.lastSeen': new Date()
              }
            }, noop);
          }, 1024);
        });
      });
    }
  }

  stop() {
    if (this.onLogin) {
      this.onLogin.stop();
      delete this.onLogin;
    }
    if (this.onLogout) {
      this.onLogout.stop();
      delete this.onLogout;
    }
    if (this.onConnection) {
      this.onConnection.stop();
      delete this.onConnection;
    }
  }
}

export { UserStatus };
