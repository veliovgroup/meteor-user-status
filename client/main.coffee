NOOP = () -> return

class UserStatusClass
  constructor: ->
    Session.setDefault 'UserStatusIdle', false
    self    = @
    @status = new ReactiveVar 'offline'
    @hidden = {}

    ###
    @description Set right visibilitychange event and property names
    ###
    @hidden.str = false
    @hidden.evt = undefined
    if typeof document.hidden isnt "undefined"
      @hidden.str = "hidden"
      @hidden.evt = "visibilitychange"
    else if typeof document.mozHidden isnt "undefined"
      @hidden.str = "mozHidden"
      @hidden.evt = "mozvisibilitychange"
    else if typeof document.msHidden isnt "undefined"
      @hidden.str = "msHidden"
      @hidden.evt = "msvisibilitychange"
    else if typeof document.webkitHidden isnt "undefined"
      @hidden.str = "webkitHidden"
      @hidden.evt = "webkitvisibilitychange"

    @hidden.check = -> document[self.hidden.str]

    ###
    @description Set active/inactive user status
    ###
    @hidden.set = ->
      if self.hidden.check()
        self.goIdle()
      else
        self.goOnline()
      return

    Tracker.autorun ->
      _user = Meteor.user()
      if _user
        Session.set 'UserStatusIdle', _user.profile.idle or false
        if _user.profile.idle
          self.status.set 'idle'
        else if _user.profile.online
          self.status.set 'online'
        else
          self.status.set 'offline'
      else
        Session.set 'UserStatusIdle', false
        self.status.set 'offline'
      return

    ###
    @description Set event listeners
    ###
    $(document).on @hidden.evt, @hidden.set
    $(window, document).on 'mousemove mousedown keypress DOMMouseScroll mousewheel touchmove MSPointerMove MSPointerMove', _.throttle(@goOnline.bind(@), 777)

  goOnline: ->
    _user = Meteor.user()
    if _user and _user._id and (_user.profile.online isnt true or _user.profile.idle isnt false)

      Meteor.users.update
        _id: _user._id
      ,
        $set:
          'profile.online': true
          'profile.idle': false
      ,
        NOOP

    return

  goIdle: ->
    _user = Meteor.user()
    if _user and _user._id and (_user.profile.online isnt true or _user.profile.idle isnt true)

      Meteor.users.update
        _id: _user._id
      ,
        $set:
          'profile.online': true
          'profile.idle': true
      ,
        NOOP
    return

  goOffline: (_user) ->
    _user ?= Meteor.user()
    if _user and _user._id and (_user.profile.online isnt false or _user.profile.idle isnt false)

      Meteor.users.update
        _id: _user._id
      ,
        $set:
          'profile.online': false
          'profile.idle': false
      ,
        NOOP
    return

  startTimer: ->
    Meteor.setInterval @goIdle.bind(@), 30000
    return

  start: ->
    @startTimer()
    return

UserStatus = new UserStatusClass()
Accounts.onLogin UserStatus.start.bind UserStatus
Accounts.onLogout UserStatus.goOffline.bind UserStatus
export { UserStatus }