Meteor user status
========
Reactively setup user's [`on`|`off`]line and idle status into `Meteor.user().profile.online`, returns `Boolean` value.

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
Simply add and use with `accounts-base` and `accounts-password` packages, `ostrio:user-status` will work just behind it on the background, - __doesn't requires any setting up__

RectiveVar `UserStatus.status` can be used to identify current user's status
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

To control idle status in current client use `Session.get('UserStatusIdle')`

For example, let's redirect idle users to almost blank page, using `iron-router` package:
Pause Template __(pause.jade)__
```html
<template name="pause">
  <h1>You are on pause</h1>
</template>
```

Create routes __(routes.coffee)__
```js
/*
 * Catch all routes
 */
Router.onBeforeAction(function() {
  Meteor.wrapAsync(function(route) {
    if (!route.route.options.omitted) {
      Session.set('prev_href', route.url);
    }
  });
});


/*
 * Example route map
 */
Router.map(function() {
  this.route('index', {
    template: 'index',
    path: '/'
  });
  this.route('pause', {
    template: 'pause',
    path: '/pause',
    omitted: true
  });
});


/*
 * Check wherever user is idle, redirect him to `/pause`, 
 * if user is active again redirect to previous URL
 */
Tracker.autorun(function() {
  if (Session.get('UserStatusIdle')) {
    Session.set('UserStatusOnPause', true);
    Router.go('/pause');
  } else if (!Session.get('UserStatusIdle') && Session.get('UserStatusOnPause')) {
    Session.set('UserStatusOnPause', false);
    Router.go(Session.get('prev_href'));
  }
});
```