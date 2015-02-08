egrid = core: require '../../'

angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'simple',
        controller: 'SimpleController'
        templateUrl: 'partials/simple.html'
        url: '/simple'
  .controller 'SimpleController', ($scope) ->
    draw = ->
      graph = egrid.core.graph.graph()
      grid = graph(
        [{text: 'hoge'}, {text: 'fuga'}, {text: 'piyo'}]
        [{source: 0, target: 1}, {source: 1, target: 2}]
      )
      egm = egrid.core.egm()
        .size [600, 200]
      d3.select 'svg.display'
        .datum grid
        .call egm

    $scope.code = draw.toString()
    draw()
