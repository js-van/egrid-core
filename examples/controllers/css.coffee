angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'css',
        controller: 'CssController'
        templateUrl: 'partials/css.html',
        url: '/css',
  .controller 'CssController', ($scope) ->
    graph = egrid.core.graph.graph()
    grid = graph(
      ['hoge', 'fuga', 'piyo']
      [{source: 0, target: 1}, {source: 1, target: 2}]
    )
    egm = egrid.core.egm()
      .vertexText Object
      .size [$('div.display-container').width(), 400]
    $scope.css =
      backgroundColor: '#ffffff'
      strokeColor: '#000000'
      upperStrokeColor: '#ff0000'
      lowerStrokeColor: '#0000ff'
      selectedStrokeColor: '#ff00ff'
    d3.select 'svg.display'
      .datum grid
      .call egm.css $scope.css
      .call egm

    $scope.update = ->
      d3.select 'svg.display'
        .call egm.css $scope.css
