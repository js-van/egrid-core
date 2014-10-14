angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'community',
        controller: 'CommunityController'
        resolve:
          data: ($http) ->
            $http.get 'data/pen.json'
        templateUrl: 'partials/community.html'
        url: '/community'
  .controller 'CommunityController', ($scope, data) ->
    $scope.paint = 'layer'
    graph = egrid.core.graph.adjacencyList()
    for node in data.data.nodes
      node.visibility = false
      graph.addVertex node
    for link in data.data.links
      graph.addEdge link.source, link.target

    groups = []
    for community, i in egrid.core.network.community.newman graph
      for u in community
        graph.get(u).community = i
      for key in ['lower', 'middle', 'upper']
        group = community.filter (u) -> graph.get(u).group is key
        if group.length > 0
          groups.push group
    mergedGraph = egrid.core.graph.reduce graph, groups, (vertices, c) ->
      text: vertices.map((u) -> graph.get(u).text).join('\n')
      vertices: vertices
      community: graph.get(vertices[0]).community
      group: graph.get(vertices[0]).group
      selected: false

    groupColor =
      upper: '#6ff'
      middle: '#cf6'
      lower: '#fc6'
    color = d3.scale.category20()
    egm1 = egrid.core.egm()
      .contentsMargin 5
      .size [800, 800]
      .layerGroup (d) -> d.group
      .vertexColor (d) ->
        if $scope.paint is 'layer'
          groupColor[d.group]
        else
          color d.community
      .vertexVisibility (d) ->
        d.visibility
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
        d.selected = not d.selected
        for u in graph.vertices()
          du = graph.get u
          if du.community is d.community
            du.visibility = not du.visibility
        display1
          .transition()
          .call egm1
          .call egm1.center()
        display2
          .transition()
          .call egm2.updateColor()
        return
      .size [800, 800]
      .vertexColor (d) ->
        if $scope.paint is 'layer'
          groupColor[d.group]
        else
          color d.community
      .vertexOpacity (d) ->
        if d.selected then '1' else '0.8'
    display2 = d3.select 'svg.display2'
      .datum mergedGraph
      .call egm2
      .call egm2.center()
      .call d3.downloadable
        filename: 'merged'
        width: 800
        height: 800

    $scope.$watch 'paint', (newValue, oldValue) ->
      if newValue isnt oldValue
        display1
          .transition()
          .call egm1.updateColor()
        display2
          .transition()
          .call egm2.updateColor()
