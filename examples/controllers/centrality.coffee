angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'centrality',
        controller: 'CentralityController'
        resolve:
          data: ($http) ->
            $http.get 'data/pen.json'
          centrality: (d3get) ->
            d3get(d3.csv 'data/pen.csv'
              .row (d) ->
                weight: +d.weight,
                degree: +d.degree,
                closeness: +d.closeness,
                betweenness: +d.betweenness,
                eigenvector: +d.eigenvector,
                katz: +d.katz,
                average: +d.average,
                naverage: +d.naverage,
                pca1: +d.pca1,
                pca2: +d.pca2
            )
        templateUrl: 'partials/centrality.html'
        url: '/centrality'
  .controller 'CentralityController', ($scope, data, centrality) ->
    graph = egrid.core.graph.graph()
    grid = graph data.data.nodes, data.data.links

    egm = egrid.core.egm()
      .enableZoom false
      .size [600, 600]
    d3.select 'svg.display'
      .datum grid
      .call egm
      .call egm.center()

    draw = ->
      extent = d3.extent grid.vertices(), (u) ->
        centrality[u][$scope.centrality]
      colorScale = d3.scale.linear()
        .domain extent
        .range [240, 0]
      scale = d3.scale.linear()
        .domain extent
        .range [0, 1]

      egm
        .vertexVisibility (_, u) ->
          scale(centrality[u][$scope.centrality]) >= $scope.threshold
        .vertexColor (_, u) ->
          d3.hsl(colorScale(centrality[u][$scope.centrality]), 1, 0.5)
            .toString()

      d3.select 'svg.display'
        .call egm.updateColor()

    $scope.centralities = [
      {value: 'weight', name: 'Weight'}
      {value: 'degree', name: 'Degree Centrality'}
      {value: 'closeness', name: 'Closeness Centrality'}
      {value: 'betweenness', name: 'Betweenness Centrality'}
      {value: 'eigenvector', name: 'Eigenvector Centrality'}
      {value: 'katz', name: 'Katz Centrality'}
    ]

    $scope.centrality = 'degree'
    $scope.$watch 'centrality', (oldValue, newValue) ->
      if  oldValue != newValue
        draw()

    $scope.threshold = 0
    $scope.$watch 'threshold', (oldValue, newValue) ->
      if oldValue != newValue
        draw()

    $scope.nVisibleNode = ->
      d3.selectAll 'svg.display g.vertex'
        .size()

    draw()
