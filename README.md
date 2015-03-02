Meteor user status
========
Reactively setup user's [`on`|`off`]line and idle status into `Meteor.user().profile.online`, returns `Boolean` value.

Install:
========
```shell
meteor add ostrio:user-status
```

Usage
========
Simply add and use with `accounts-base` and `accounts-password` packages, `ostrio:user-status` will work just behind it on the background, - __doesn't requires any setting up__

Updated user's object
========
```coffeescript
User = 
  username: String
  emails: [Object]
  createdAt: Date
  updatedAt: Date
  profile:
    location:
      ip: String    # --> Current or last used user's IP
    online: Boolean # --> Is user online
    idle: Boolean   # --> Is user online but idle
    lastLogin: Date # --> Current or last login time
  connection: String# --> Current or last used DDP Connection ID
```


Idle Status
========
__Why idle?:__ Some apps require your constant attention. Such apps often include games, media players, anything that is CPU/battery intensive, and so on. For these kinds of apps, it may be important (as well as user-friendly) to do something when a user is no longer actively interacting with your app.

To control idle status in current client use `Session.get('UserStatusIdle')`

For example, let's redirect idle users to almost blank page, using `iron-router` package:
Pause Template __(pause.jade)__
```jade
template(name="pause")
  h1.center You are on pause
```

Create routes __(routes.coffee)__
```coffeescript
###
@description Catch all routes
###
Router.onBeforeAction ->
  Meteor.wrapAsync( (route) ->
    if !route.route.options.omitted
      Session.set 'prev_href', route.url

###
@description Create route map
###
Router.map ->
  @route 'index',
    template: 'index'
    path: '/'

  @route 'pause',
    template: 'pause'
    path: '/pause'
    omitted: true

###
@description Check wherever user is idle, redirect him to `/pause`, 
             if user is active again redirect to previous URL
###
Tracker.autorun ->
  if Session.get 'UserStatusIdle'
    Session.set 'UserStatusOnPause', true
    Router.go('/pause')
  else if !Session.get('UserStatusIdle') and Session.get 'UserStatusOnPause'
    Session.set 'UserStatusOnPause', false
    Router.go(Session.get('prev_href'))
```