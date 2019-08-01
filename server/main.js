import { check }    from 'meteor/check';
import { Meteor }   from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

const NoOp = function NoOp () {};

class UserStatus {
  constructor() {
    Meteor.methods({
      'UserStatusUpdate'(online, idle) {
        check(online, Boolean);
        check(idle, Boolean);

        if (!this.userId) {
          return false;
        }

        const user = Meteor.users.findOne({ _id: this.userId });
        if (user.profile.status.online !== online || user.profile.status.idle !== idle) {
          Meteor.users.update({
            _id: this.userId
          }, {
            $set: {
              connection: this.connection.id,
              'profile.status.online': online,
              'profile.status.idle': idle,
              'profile.status.lastSeen': new Date()
            }
          }, NoOp);
        }

        return true;
      }
    });
    this.start();
  }
  start() {
    this.onLogin = Accounts.onLogin((data) => {
      Meteor.users.update({
        _id: data.user._id
      }, {
        $set: {
          connection: data.connection.id,
          'profile.status.online': true,
          'profile.status.idle': false,
          'profile.status.lastLogin': new Date(),
          'profile.status.lastSeen': new Date()
        }
      }, NoOp);
    });

    this.onLogout = Accounts.onLogout((data) => {
      Meteor.users.update({
        _id: data.user._id
      }, {
        $set: {
          connection: data.connection.id,
          'profile.status.online': false,
          'profile.status.idle': false,
          'profile.status.lastSeen': new Date()
        }
      }, NoOp);
    });

    this.onConnection = Meteor.onConnection((connection) => {
      const connectionId = connection.id;

      connection.onClose(() => {
        Meteor.users.update({
          connection: connectionId
        }, {
          $set: {
            'profile.status.online': false,
            'profile.status.idle': false,
            'profile.status.lastSeen': new Date()
          }
        }, NoOp);
      });
    });
  }

  stop() {
    if (this.onLogin) {
      this.onLogin.stop();
      this.onLogin = void 0;
    }
    if (this.onLogout) {
      this.onLogout.stop();
      this.onLogout = void 0;
    }
    if (this.onConnection) {
      this.onConnection.stop();
      this.onConnection = void 0;
    }
  }
}

export { UserStatus };
