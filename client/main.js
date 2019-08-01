import throttle        from '../lib/throttle.js';
import { Meteor }      from 'meteor/meteor';
import { Accounts }    from 'meteor/accounts-base';
import { ReactiveVar } from 'meteor/reactive-var';

const NoOp = function NoOp () {};

class UserStatus {
  constructor() {
    this.isRunning = false;
    this.status = new ReactiveVar('online');
    this.hidden = {};

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

    this.hidden.set = () => {
      if (this.hidden.check()) {
        this.goIdle();
      } else {
        this.goOnline();
      }
    };

    this.throttledGoOnline = throttle(this.goOnline.bind(this), 2048);
    this.start();
  }

  on(obj, events, fn) {
    events.forEach((event) => {
      if (obj.addEventListener) {
        obj.addEventListener(event, fn, { passive: true, capture: false });
      } else {
        obj.attachEvent('on' + event, fn);
      }
    });
  }

  off(obj, events, fn) {
    events.forEach((event) => {
      if (obj.removeEventListener) {
        obj.removeEventListener(event, fn, { passive: true, capture: false });
      } else {
        obj.detachEvent('on' + event, fn);
      }
    });
  }

  goOnline() {
    const user = Meteor.user();
    this.status.set('online');
    if (user && user._id && user.profile && user.profile.status && (user.profile.status.online !== true || user.profile.status.idle !== false)) {
      Meteor.call('UserStatusUpdate', true, false, NoOp);
    }
  }

  goIdle() {
    const user = Meteor.user();
    this.status.set('idle');
    if (user && user._id && user.profile && user.profile.status && (user.profile.status.online !== true || user.profile.status.idle !== true)) {
      Meteor.call('UserStatusUpdate', true, true, NoOp);
    }
  }

  goOffline(user = Meteor.user()) {
    this.status.set('offline');
    if (user && user._id && user.profile && user.profile.status && (user.profile.status.online !== false || user.profile.status.idle !== false)) {
      Meteor.call('UserStatusUpdate', false, false, NoOp);
    }
  }

  startTimer() {
    this.stopTimer();
    this.timerId = Meteor.setInterval(this.goIdle.bind(this), 30000);
  }

  stopTimer() {
    if (this.timerId) {
      Meteor.clearInterval(this.timerId);
      this.timerId = void 0;
    }
  }

  start() {
    if (this.isRunning === false) {
      this.onLogin = Accounts.onLogin(this.goOnline.bind(this));
      this.onLogout = Accounts.onLogout(this.goOffline.bind(this));

      this.startTimer();
      this.on(document, [this.hidden.evt], this.hidden.set);
      this.on(window, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline);
      this.on(document, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline);
      this.isRunning = true;
    }
  }

  stop() {
    if (this.isRunning === true) {
      if (this.onLogin) {
        this.onLogin.stop();
        this.onLogin = void 0;
      }
      if (this.onLogout) {
        this.onLogout.stop();
        this.onLogout = void 0;
      }

      this.stopTimer();
      this.off(document, [this.hidden.evt], this.hidden.set);
      this.off(window, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline);
      this.off(document, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline);
      this.isRunning = false;
    }
  }
}

export { UserStatus };
