[![support](https://img.shields.io/badge/support-GitHub-white)](https://github.com/sponsors/dr-dimitru)
[![support](https://img.shields.io/badge/support-PayPal-white)](https://paypal.me/veliovgroup)
<a href="https://ostr.io/info/built-by-developers-for-developers">
  <img src="https://ostr.io/apple-touch-icon-60x60.png" height="20">
</a>

# Meteor user-status

Reactive user's online, offline, and idle status updates. Current user's status stored in `Meteor.user().profile.status.online`, returns `Boolean` value.

- __Demo:__ [`meteor-user-status-demo`](https://github.com/veliovgroup/meteor-user-status-demo)

## Install:

```shell
meteor add ostrio:user-status
```

### ES6 Import:

```js
import { UserStatus } from 'meteor/ostrio:user-status';
```

## API

`new UserStatus({opts})` constructor accepts couple of options:

- `opts` {*Object*}
- `opts.throttleTiming` {*Number*} — time in milliseconds between consecutive method calls; Default: `2048`
- `opts.idleTimeout` {*Number*} — timeout in milliseconds to consider user status __idle__; Default: `30000`

```js
import { UserStatus } from 'meteor/ostrio:user-status';
const userStatus = new UserStatus({ idleTimeout: 5000 });
```

- `userStatus.status` {*ReactiveVar*} — Returns *String*, one of: `offline`, `online`, or `idle`
- `userStatus.stop()` {*Function*} — Stop tracking user's status
- `userStatus.start()` {*Boolean*} — Start tracking user's status, *called upon constructor initialization*
- `userStatus.isRunning` {*Boolean*}

## Usage

Use it as it is on the Client or with `accounts-*` packages. When used with *Accounts* — `ostrio:user-status` will update user's record in a MongoDB with its current status. Package work silently in the background and __doesn't require any setting up__, just initialize constructor.

Once initialized — use `userStatus.status` *ReactiveVar* to get current user's status in front end.

```js
import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/ostrio:user-status';

// INITIATE UserStatus ON CLIENT/BROWSER
// TO BUILD FONT END LOGC AROUND online AND idle STATUSES
if (Meteor.isClient) {
  const userStatus = new UserStatus();

  // [Reactive] get current user's status, one of — offline, online, idle
  userStatus.status.get();

  // Stop tracking user's status on the client (browser)
  userStatus.stop();

  // Start tracking user's status on the client (browser),
  // without creating `new UserStatus()` instance
  userStatus.start();
}

// OPTIONALLY INITIATE UserStatus ON SERVER
// THIS IS REQUIRED ONLY TO UPDATE USER'S OBJECT IN MONGODB
if (Meteor.isServer) {
  // NOTE: WHEN INITIALIZED ON SERVER
  // LOGIN/LOGOUT HOOKS APPLIED TO ALL USERS
  const userStatus = new UserStatus();

  // Stop tracking user's status on the Server
  userStatus.stop();

  // Re-start tracking user's status on the Server
  userStatus.start();

  // NOTE: CALLING `new UserStatus()` TWICE
  // ON THE SERVER WILL THROW AN EXCEPTION!
}
```

### Updated user's object

```js
{
  connection: String, //-> Current or last used DDP Connection ID
  profile: {
    status: {
      online: Boolean, //-> Is user online
      idle: Boolean,   //-> Is user online but idle
      lastLogin: Date, //-> Current or last login time
      lastSeen: Date   //-> Last Date when user has changed its status
    }
  }
};
```

## Idle Status

__Why idle?:__ Some apps require your constant attention. Such apps often include games, media players, anything that is CPU/battery intensive, and so on. For these kinds of apps, it may be important (as well as user-friendly) to do something when a user is no longer actively interacting with your app.

__Why online and last seen?:__ Some apps like chats, forums and other social platforms may require to show user's `(on|off)line` status. If user is offline at the moment such apps require to show the last date when user was active.

__Why track connection id?:__ Established DDP connection is user-less, to find right user from database we're using DDP's `connection` id.

## Support this project:

- [Sponsor veliovgroup via GitHub](https://github.com/sponsors/veliovgroup) — support company behind this package
- [Support via PayPal](https://paypal.me/veliovgroup) — support our open source contributions
- Use [ostr.io](https://ostr.io) — [Monitoring](https://snmp-monitoring.com), [Analytics](https://ostr.io/info/web-analytics), [WebSec](https://domain-protection.info), [Web-CRON](https://web-cron.info) and [Pre-rendering](https://prerendering.com) for a website
