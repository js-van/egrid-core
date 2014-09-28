angular.module 'egrid-core-example', ['ui.router']
  .factory 'd3get', ($q) ->
    (xhr) ->
      deferred = $q.defer()
      xhr
        .on 'load', (data) ->
          deferred.resolve data
        .on 'error', (ststus) ->
          deferred.reject status
        .get()
      deferred.promise
  .config ($urlRouterProvider) ->
    $urlRouterProvider.otherwise '/color'
