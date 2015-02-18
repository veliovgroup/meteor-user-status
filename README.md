Meteor user status
========
Reactively setup user's [on|off]line status into `Meteor.user().profile.online`, returns `Boolean` value.

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
      ip: String # --> Current or last used user's IP
    online: Boolean # --> Is user online
  connection: String # --> Current or last used DDP Connection ID
```