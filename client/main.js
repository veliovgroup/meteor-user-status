import throttle from '../lib/throttle.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { ReactiveVar } from 'meteor/reactive-var';
import { check, Match } from 'meteor/check';

const noop = function noop () {};
const DEFAULT_THROTTLE_TIMING = 2048;
const DEFAULT_IDLE_TIMEOUT = 30000;

class UserStatus {
  constructor(opts) {
    check(opts, Match.Optional({
      throttleTiming: Match.Optional(Number),
      idleTimeout: Match.Optional(Number)
    }));

    this.opts = opts || {
      throttleTiming: DEFAULT_THROTTLE_TIMING,
      idleTimeout: DEFAULT_IDLE_TIMEOUT
    };

    if (!this.opts.throttleTiming) {
      this.opts.throttleTiming = DEFAULT_THROTTLE_TIMING;
    }

    if (!this.opts.idleTimeout) {
      this.opts.idleTimeout = DEFAULT_IDLE_TIMEOUT;
    }

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
        this.throttledGoIdle();
      } else {
        this.throttledGoOnline();
      }
    };

    this.throttledGoOnline = throttle(this.goOnline.bind(this), opts.throttleTiming);
    this.throttledGoOffline = throttle(this.goOffline.bind(this), opts.throttleTiming);
    this.throttledGoIdle = throttle(this.goIdle.bind(this), opts.throttleTiming);
    this.start();
  }

  on(obj, events, fn) {
    events.forEach((event) => {
      if (obj.addEventListener) {
        obj.addEventListener(event, fn, { passive: true, capture: false });
      } else {
        obj.attachEvent(`on${event}`, fn);
      }
    });
  }

  off(obj, events, fn) {
    events.forEach((event) => {
      if (obj.removeEventListener) {
        obj.removeEventListener(event, fn, { passive: true, capture: false });
      } else {
        obj.detachEvent(`on${event}`, fn);
      }
    });
  }

  goOnline() {
    this.status.set('online');
    this.stopTimer();
    const user = Meteor.user?.();
    if (user && (user.profile?.status?.online !== true || user.profile?.status?.idle !== false)) {
      try {
        Meteor.call('user-status.update', true, false, () => {
          this.startTimer();
        });
      } catch (e) {
        // -silently ignore errors, as the most probably UserStatus not initialized on a Server
      }
    } else {
      this.startTimer();
    }
  }

  goIdle() {
    this.status.set('idle');
    this.stopTimer();
    const user = Meteor.user?.();
    if (user && user.profile?.status?.idle !== true) {
      try {
        Meteor.call('user-status.update', true, true, noop);
      } catch (e) {
        // -silently ignore errors, as the most probably UserStatus not initialized on a Server
      }
    }
  }

  goOffline() {
    this.status.set('offline');
    this.stopTimer();
  }

  startTimer() {
    this.stopTimer();
    this.timerId = Meteor.setInterval(this.throttledGoIdle.bind(this), this.opts.idleTimeout);
  }

  stopTimer() {
    if (this.timerId) {
      Meteor.clearInterval(this.timerId);
      delete this.timerId;
    }
  }

  start() {
    if (this.isRunning === false) {
      this.tracker = Tracker.autorun(() => {
        if (Meteor.status().connected === true) {
          this.throttledGoOnline();
        } else {
          this.throttledGoOffline();
        }
      });

      this.startTimer();
      this.on(document, [this.hidden.evt], this.hidden.set);
      this.on(window, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline.bind(this));
      this.on(document, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline.bind(this));
      this.isRunning = true;
    }
  }

  stop() {
    if (this.isRunning === true) {
      if (this.onLogin) {
        this.onLogin.stop();
        delete this.onLogin;
      }
      if (this.onLogout) {
        this.onLogout.stop();
        delete this.onLogout;
      }
      if (this.tracker) {
        this.tracker.stop();
        delete this.tracker;
      }

      this.stopTimer();
      this.off(document, [this.hidden.evt], this.hidden.set);
      this.off(window, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline.bind(this));
      this.off(document, ['mousemove', 'mousedown', 'keypress', 'DOMMouseScroll', 'mousewheel', 'touchmove', 'MSPointerMove', 'MSPointerMove'], this.throttledGoOnline.bind(this));
      this.isRunning = false;
    }
  }
}

export { UserStatus };
