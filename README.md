Meteor user status
========
Reactively setup user's [`on`|`off`]line and idle status into `Meteor.user().profile.online`, returns `Boolean` value. __This package is meant to work only within `accounts-base` package, when users will login/logout.__

Install:
========
```shell
meteor add ostrio:user-status
```

ES6 Import:
========
```jsx
import { UserStatus } from 'meteor/ostrio:user-status';
```

Usage
========
Simply add and use with `accounts-base` and `accounts-password` packages, `ostrio:user-status` will work silently behind it in the background, - __doesn't require any setting up__.

ReactiveVar `UserStatus.status` can be used to identify current user's status
```js
import { UserStatus } from 'meteor/ostrio:user-status';
UserStatus.status.get(); // One of offline, online, idle
```

Session `UserStatusIdle` can be used to identify if user currently is idle
```js
Session.get('UserStatusIdle'); // Boolean true when user is idle
```

Updated user's object
========
```js
{
  username: String,
  emails: [Object],
  createdAt: Date,
  updatedAt: Date,
  profile: {
    location: {
      ip: String     //-> Current or last used user's IP
    },
    online: Boolean, //-> Is user online
    idle: Boolean,   //-> Is user online but idle
    lastLogin: Date  //-> Current or last login time
  },
  connection: String //-> Current or last used DDP Connection ID
};
```


Idle Status
========
__Why idle?:__ Some apps require your constant attention. Such apps often include games, media players, anything that is CPU/battery intensive, and so on. For these kinds of apps, it may be important (as well as user-friendly) to do something when a user is no longer actively interacting with your app.

To control idle status for current client use - `Session.get('UserStatusIdle')`.
