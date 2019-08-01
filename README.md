# Meteor user-status

<a href="https://www.patreon.com/bePatron?u=20396046">
  <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
</a>

Reactively setup user's [`on`|`off`]line and idle status into `Meteor.user().profile.status.online`, returns `Boolean` value.

## Install:

```shell
meteor add ostrio:user-status
```

### ES6 Import:

```js
import { UserStatus } from 'meteor/ostrio:user-status';
```

## Usage

Simply add and use with `accounts-base` packages, `ostrio:user-status` will work silently behind it in the background, - __doesn't require any setting up__.

*ReactiveVar* `userStatus.status` can be used to identify current user's status

```js
import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/ostrio:user-status';

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
  username: String,   //-> Default `username` field
  connection: String, //-> Current or last used DDP Connection ID
  profile:
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

- [Become a patron](https://www.patreon.com/bePatron?u=20396046) — support my open source contributions with monthly donation
- Use [ostr.io](https://ostr.io) — [Monitoring](https://snmp-monitoring.com), [Analytics](https://ostr.io/info/web-analytics), [WebSec](https://domain-protection.info), [Web-CRON](https://web-cron.info) and [Pre-rendering](https://prerendering.com) for a website
