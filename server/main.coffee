key  = Random.secret()
NOOP = () -> return

Accounts.onLogin (data) ->
  Meteor.users.update
    _id: data.user._id
  ,
    $set:
      connection: data.connection.id
      'profile.online': true
      'profile.idle': false
      'profile.location.ip': data.connection.clientAddress
      'profile.lastLogin': new Date()
  ,
    NOOP
  return

Accounts.onLogout (data) ->
  Meteor.users.update
    _id: data.user._id
  ,
    $set:
      connection: data.connection.id
      'profile.online': false
      'profile.idle': false
      'profile.location.ip': data.connection.clientAddress
  ,
    NOOP
  return


###
@description connection.onClose to set when user is not online
###
Meteor.onConnection (connection) ->
  connectionId = connection.id
  connection.onClose ->
    Meteor.users.update 
      connection: connectionId
    ,
      $set:
        'profile.online': false
        'profile.idle': false
    ,
     NOOP
    return
  return