Meteor.startup ->
  ###
  @description Set default session's and RectiveVar's values for token and userId
  ###
  Session.setDefault 'UserStatusIdle', false
  UserStatusToken = new ReactiveVar null
  UserStatusUserId = new ReactiveVar null
  UserStatusIsStarted = false

  ###
  @description Re-run condition each time Session's value is changed
  ###
  Tracker.autorun =>
    # @description Clear timer if it already somewhy created
    if UserStatus and _.has UserStatus, 'timeoutID'
      Meteor.clearTimeout UserStatus.timeoutID

    # @description Store userId into "UserStatusUserId" ReactiveVar and get token from server method
    if Meteor.userId() and !UserStatusToken.get()
      UserStatusUserId.set Meteor.userId()
      Meteor.call 'UserStatusGetToken', UserStatusUserId.get(), (err, data) ->
        throw new Meteor.Error 'Error on calling "UserStatusGetSecure"', err if err
        UserStatusToken.set(data)

    # @description If we are already have userId and token, then update user status to 
    else if Meteor.userId() and UserStatusToken.get()
      Meteor.call 'UserStatusSet', UserStatusUserId.get(), UserStatusToken.get(), true, (err) ->
        throw new Meteor.Error 'Error on calling "UserStatusSet"', err if err

    # @description If we are already have userId and token, but user isn't logged in, then update user status to 
    else if !Meteor.userId() and UserStatusUserId.get() and UserStatusToken.get()
      Meteor.call 'UserStatusSet', UserStatusUserId.get(), UserStatusToken.get(), false, (err) ->
        throw new Meteor.Error 'Error on calling "UserStatusSet"', err if err

    # @description If user logged in only
    if Meteor.userId() and !UserStatusIsStarted
      UserStatus = 
        hidden: {}
        timeoutID: ''
        goActive: ->
          Meteor.clearTimeout UserStatus.timeoutID
          Session.set 'UserStatusIdle', false

          if Meteor.user().profile.online isnt true or Meteor.user().profile.idle isnt false
            Meteor.users.update
              _id: Meteor.userId()
            ,
              '$set':
                'profile.online': true
                'profile.idle': false

          UserStatus.startTimer()

        goInactive: ->
          Session.set 'UserStatusIdle', true

          Meteor.users.update
            _id: Meteor.userId()
          ,
            '$set':
              'profile.online': true
              'profile.idle': true

        startTimer: ->
          UserStatus.timeoutID = Meteor.setTimeout UserStatus.goInactive, 60000

      # @description Set right visibilitychange event and property names
      UserStatus.hidden.str = false
      UserStatus.hidden.evt = undefined
      if typeof document.hidden isnt "undefined"
        UserStatus.hidden.str = "hidden"
        UserStatus.hidden.evt = "visibilitychange"
      else if typeof document.mozHidden isnt "undefined"
        UserStatus.hidden.str = "mozHidden"
        UserStatus.hidden.evt = "mozvisibilitychange"
      else if typeof document.msHidden isnt "undefined"
        UserStatus.hidden.str = "msHidden"
        UserStatus.hidden.evt = "msvisibilitychange"
      else if typeof document.webkitHidden isnt "undefined"
        UserStatus.hidden.str = "webkitHidden"
        UserStatus.hidden.evt = "webkitvisibilitychange"

      # @description Check if document is visible to user right now
      UserStatus.hidden.check = ->
        return document[UserStatus.hidden.str] 

      # @description Set active/inactive user status
      UserStatus.hidden.set = ->
        if UserStatus.hidden.check() 
          UserStatus.goInactive()
        else
          UserStatus.goActive()

      # @description Set event listeners
      @addEventListener "mousemove", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "mousedown", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "keypress", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "DOMMouseScroll", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "mousewheel", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "touchmove", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "MSPointerMove", _.throttle(UserStatus.goActive, 777), false
      @addEventListener "MSPointerMove", _.throttle(UserStatus.goActive, 777), false
      document.addEventListener UserStatus.hidden.evt, UserStatus.hidden.set, false

      # @description Start timer by default
      UserStatus.startTimer()
      UserStatusIsStarted = true