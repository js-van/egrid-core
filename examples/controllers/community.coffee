angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'community',
        controller: 'CommunityController'
        resolve:
          data: ($http) ->
            $http.get 'data/travel.json'
        templateUrl: 'partials/community.html'
        url: '/community'
  .controller 'CommunityController', ($scope, data) ->
    graph = egrid.core.graph.adjacencyList()
    for node in data.data.nodes
      graph.addVertex node
    for link in data.data.links
      graph.addEdge link.source, link.target

    communities = egrid.core.network.community.newman graph
    console.log communities

    mergedGraph = egrid.core.graph.adjacencyList()
    mergedVertices = []
    for community, i in communities
      for u in community
        graph.get(u).community = i
      mergedVertices.push mergedGraph.addVertex
        text: community.map((u) -> graph.get(u).text).join('\n')

    for community1, i in communities
      for community2, j in communities[i + 1..-1]
        for u in community1
          for v in community2
            if graph.edge(u, v)
              mergedGraph.addEdge i, j
            else if graph.edge(v, u)
              mergedGraph.addEdge j, i

    color = d3.scale.category20()
    egm1 = egrid.core.egm()
      .contentsMargin 5
      .size [800, 800]
      .vertexColor (d) -> color d.community
    d3.select 'svg.display1'
      .datum graph
      .call egm1
      .call egm1.center()
      .call d3.downloadable
        filename: 'original'
        width: 800
        height: 800
    egm2 = egrid.core.egm()
      .contentsMargin 5
      .size [800, 800]
      .vertexColor (d, u) -> color u
    d3.select 'svg.display2'
      .datum mergedGraph
      .call egm2
      .call egm2.center()
      .call d3.downloadable
        filename: 'merged'
        width: 800
        height: 800
