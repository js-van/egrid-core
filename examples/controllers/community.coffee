angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'community',
        controller: 'CommunityController'
        resolve:
          data: ($http) ->
            $http.get 'data/pen2.json'
        templateUrl: 'partials/community.html'
        url: '/community'
  .controller 'CommunityController', ($scope, data) ->
    graph = egrid.core.graph.adjacencyList()
    for node in data.data.nodes
      node.visibility = false
      graph.addVertex node
    for link in data.data.links
      graph.addEdge link.source, link.target

    mergedGraph = egrid.core.network.community.reduce graph, (vertices, c) ->
      for u in vertices
        graph.get(u).community = c
      text: vertices.map((u) -> graph.get(u).text).join('\n')
      vertices: vertices

    color = d3.scale.category20()
    egm1 = egrid.core.egm()
      .contentsMargin 5
      .size [800, 800]
      .vertexColor (d) -> color d.community
      .vertexVisibility (d) -> d.visibility
    display1 = d3.select 'svg.display1'
      .datum graph
      .call egm1
      .call egm1.center()
      .call d3.downloadable
        filename: 'original'
        width: 800
        height: 800
    egm2 = egrid.core.egm()
      .contentsMargin 5
      .onClickVertex (d) ->
        for u in d.vertices
          du = graph.get(u)
          du.visibility = not du.visibility
        display1
          .transition()
          .call egm1
          .call egm1.center()
        return
      .size [800, 800]
      .vertexColor (d, u) ->
        color u
    d3.select 'svg.display2'
      .datum mergedGraph
      .call egm2
      .call egm2.center()
      .call d3.downloadable
        filename: 'merged'
        width: 800
        height: 800
