import { _ }           from 'meteor/underscore';
import { $ }           from 'meteor/jquery';
import { Meteor }      from 'meteor/meteor';
import { Session }     from 'meteor/session';
import { Tracker }     from 'meteor/tracker';
import { Accounts }    from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';

const NoOp = function() {};

class UserStatusClass {
  constructor() {
    Session.setDefault('UserStatusIdle', false);
    this.status = new ReactiveVar('offline');
    this.hidden = {};

    /* @description Set right visibilitychange event and property names */
    this.hidden.str = false;
    this.hidden.evt = void 0;
    if (typeof document.hidden !== 'undefined') {
      this.hidden.str = 'hidden';
      this.hidden.evt = 'visibilitychange';
    } else if (typeof document.mozHidden !== 'undefined') {
      this.hidden.str = 'mozHidden';
      this.hidden.evt = 'mozvisibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      this.hidden.str = 'msHidden';
      this.hidden.evt = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      this.hidden.str = 'webkitHidden';
      this.hidden.evt = 'webkitvisibilitychange';
    }

    this.hidden.check = () => {
      return document[this.hidden.str];
    };

    /* @description Set active/inactive user status */
    this.hidden.set = () => {
      if (this.hidden.check()) {
        this.goIdle();
      } else {
        this.goOnline();
      }
    };

    Tracker.autorun(() => {
      const _user = Meteor.user();
      if (_user) {
        Session.set('UserStatusIdle', _user.profile.idle || false);
        if (_user.profile.idle) {
          this.status.set('idle');
        } else if (_user.profile.online) {
          this.status.set('online');
        } else {
          this.status.set('offline');
        }
      } else {
        Session.set('UserStatusIdle', false);
        this.status.set('offline');
      }
    });

    /* @description Set event listeners */
    $(document).on(this.hidden.evt, this.hidden.set);
    $(window, document).on('mousemove mousedown keypress DOMMouseScroll mousewheel touchmove MSPointerMove MSPointerMove', _.throttle(this.goOnline.bind(this), 777));
  }

  goOnline() {
    const _user = Meteor.user();
    if (_user && _user._id && (_user.profile.online !== true || _user.profile.idle !== false)) {
      Meteor.users.update({
        _id: _user._id
      }, {
        $set: {
          'profile.online': true,
          'profile.idle': false
        }
      }, NoOp);
    }
  }

  goIdle() {
    const _user = Meteor.user();
    if (_user && _user._id && (_user.profile.online !== true || _user.profile.idle !== true)) {
      Meteor.users.update({
        _id: _user._id
      }, {
        $set: {
          'profile.online': true,
          'profile.idle': true
        }
      }, NoOp);
    }
  }

  goOffline(_user = Meteor.user()) {
    if (_user && _user._id && (_user.profile.online !== false || _user.profile.idle !== false)) {
      Meteor.users.update({
        _id: _user._id
      }, {
        $set: {
          'profile.online': false,
          'profile.idle': false
        }
      }, NoOp);
    }
  }

  startTimer() {
    Meteor.setInterval(this.goIdle.bind(this), 30000);
  }

  start() {
    this.startTimer();
  }
}

const UserStatus = new UserStatusClass();
Accounts.onLogin(UserStatus.start.bind(UserStatus));
Accounts.onLogout(UserStatus.goOffline.bind(UserStatus));

export { UserStatus };
