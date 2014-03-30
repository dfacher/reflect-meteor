Router.map ->
  @route 'home',
    path: '/'
    
  @route 'app',
    path: '/app'
    layoutTemplate: 'appLayout'
    before: ->
      AccountsEntry.signInRequired(@)