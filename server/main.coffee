Meteor.startup ->
  key = String.generate 30

  ###
  @description Check login methodName and store connection data into user's profile
  ###
  Accounts.validateLoginAttempt (attempt) ->
    
    if !attempt.error and attempt.user
      Meteor.users.update
        _id: attempt.user._id
      ,
        '$set':
          connection: attempt.connection.id
          'profile.online': true
          'profile.idle': false
          'profile.location.ip': attempt.connection.clientAddress

    return if !attempt.error and attempt.user then true else false


  ###
  @description connection.onClose to set when user is not online
  ###
  Meteor.onConnection (connection) ->
    connectionId = connection.id
    connection.onClose () ->
      Meteor.users.update 
        connection: connectionId
      ,
        '$set':
          'profile.online': false
          'profile.idle': false


  ###
  @description Set user status via methods
  ###
  Meteor.methods
    UserStatusGetToken: (i) ->
      SHA256 "#{i}_#{key}" if i is this.userId
        
    UserStatusSet: (i, s, status) ->
      check(status, Boolean);
      if s is SHA256 "#{i}_#{key}"
        Meteor.users.update
            _id: i
          ,
            '$set':
              'profile.online': status
              'profile.idle': false