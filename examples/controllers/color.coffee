egrid = core: require '../../'

angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'color',
        controller: 'ColorController'
        templateUrl: 'partials/color.html',
        url: '/color',
  .controller 'ColorController', ($scope) ->
    nodes = [
      {text: 'aaa', size: 1, visible: true, color: '#ff0000', opacity: 0.5}
      {text: 'いいい', size: 2, visible: true, color: '#00ff00', opacity: 0.8}
      {text: 'ccc', size: 3, visible: true, color: '#0000ff', opacity: 0.2}
      {text: 'ddd', size: 4, visible: true, color: '#00ffff', opacity: 0.4}
      {text: 'eee', size: 5, visible: true, color: '#ff00ff', opacity: 0.6}
      {text: 'fff', size: 6, visible: false, color: '#ffff00', opacity: 0.7}
    ]
    links = [
      {source: 0, target: 1}
      {source: 1, target: 2}
      {source: 3, target: 1}
      {source: 1, target: 4}
      {source: 1, target: 5}
    ]
    edgeText =
      '0,1': 'A'
      '1,2': 'B'
      '3,1': 'C'
      '1,4': 'D'
      '1,5': 'E'
    graph = egrid.core.graph.graph()
    grid = graph nodes, links
    egm = egrid.core.egm()
      .edgeColor (u, v) -> grid.get(u).color
      .edgeOpacity (u, v) -> (grid.get(u).opacity + grid.get(v).opacity) / 2
      .edgeText (u, v) -> edgeText[u + ',' + v] || ''
      .edgeWidth (u, v) -> (grid.get(u).size + grid.get(v).size) / 2
      .enableClickVertex true
      .vertexColor (vertex) -> vertex.color
      .vertexOpacity (vertex) -> vertex.opacity
      .vertexScale (vertex) -> vertex.size
      .vertexVisibility (vertex) -> vertex.visible
      .size [$('div.display-container').width(), 300]
    d3.select 'svg.display'
      .datum grid
      .call egm

    $scope.vertices = grid.vertices().map (u) -> grid.get u
    $scope.update = ->
      d3.select 'svg.display'
        .call egm
    $scope.updateColor = ->
      d3.select 'svg.display'
        .call egm.updateColor()
