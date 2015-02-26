###
@description Set default session values for token and userId
###
Session.setDefault 'UserStatusIdle', false
Session.setDefault 'UserStatusToken', null
Session.setDefault 'UserStatusUserId', null

###
@description Re-run condition each time Session's value is changed
###
Tracker.autorun =>
  # @description Clear timer if it already somewhy created
  if UserStatus and _.has UserStatus, 'timeoutID'
    Meteor.clearTimeout UserStatus.timeoutID

  # @description Store userId into "UserStatusUserId" Session and get token from server method
  if Meteor.userId() and !Session.get 'UserStatusToken'
    Session.set 'UserStatusUserId', Meteor.userId()
    Meteor.call 'UserStatusGetToken', Session.get('UserStatusUserId'), (err, data) ->
      throw new Meteor.Error 'Error on calling "UserStatusGetSecure"', err if err
      Session.set 'UserStatusToken', data

  # @description If we are already have userId and token, then update user status to 
  else if Meteor.userId() and Session.get 'UserStatusToken'
    Meteor.call 'UserStatusSet', Session.get('UserStatusUserId'), Session.get('UserStatusToken'), true, (err) ->
      throw new Meteor.Error 'Error on calling "UserStatusSet"', err if err

  # @description If we are already have userId and token, but user isn't logged in, then update user status to 
  else if !Meteor.userId() and Session.get('UserStatusUserId') and Session.get 'UserStatusToken'
    Meteor.call 'UserStatusSet', Session.get('UserStatusUserId'), Session.get('UserStatusToken'), false, (err) ->
      throw new Meteor.Error 'Error on calling "UserStatusSet"', err if err

  # @description If user logged in only
  if Meteor.userId()
    UserStatus = 
      hidden: {}
      timeoutID: ''
      goActive: ->
        Meteor.clearTimeout UserStatus.timeoutID
        Session.set 'UserStatusIdle', false

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
    @addEventListener "mousemove", UserStatus.goActive, false
    @addEventListener "mousedown", UserStatus.goActive, false
    @addEventListener "keypress", UserStatus.goActive, false
    @addEventListener "DOMMouseScroll", UserStatus.goActive, false
    @addEventListener "mousewheel", UserStatus.goActive, false
    @addEventListener "touchmove", UserStatus.goActive, false
    @addEventListener "MSPointerMove", UserStatus.goActive, false
    @addEventListener "MSPointerMove", UserStatus.goActive, false
    document.addEventListener UserStatus.hidden.evt, UserStatus.hidden.set, false

    # @description Start timer by default
    UserStatus.startTimer()