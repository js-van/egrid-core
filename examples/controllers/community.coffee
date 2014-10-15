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
    $scope.paint = 'community'
    activeOpacity = '1'
    inactiveOpacity = '0.6'

    graph = egrid.core.graph.adjacencyList()
    for node in data.data.nodes
      node.visibility = true
      graph.addVertex node
    for link in data.data.links
      graph.addEdge link.source, link.target

    groups = []
    newVertices = {}
    tmpGraph = egrid.core.graph.adjacencyList()
    for community, i in egrid.core.network.community.newman graph
      vertices = community.map (u) ->
        newU = tmpGraph.addVertex graph.get u
        newVertices[u] = newU
        newU
      for u in vertices
        tmpGraph.get(u).community = i
      for key in ['lower', 'middle', 'upper']
        group = vertices.filter (u) -> tmpGraph.get(u).group is key
        if group.length > 0
          groups.push group
    for [u, v] in graph.edges()
      tmpGraph.addEdge newVertices[u], newVertices[v]
    graph = tmpGraph
    for [u, v] in egrid.core.graph.redundantEdges graph
      graph.removeEdge u, v

    mergedGraph = egrid.core.graph.reduce graph, groups, (vertices, c) ->
      text: vertices.map((u) -> graph.get(u).text).join('\n')
      vertices: vertices
      community: graph.get(vertices[0]).community
      group: graph.get(vertices[0]).group
      selected: true
    for u in mergedGraph.vertices()
      du = mergedGraph.get u
      if du.group is 'upper'
        middle = lower = null
        for v in mergedGraph.adjacentVertices u
          dv = mergedGraph.get v
          if dv.community is du.community
            if dv.group is 'middle'
              middle = v
            else if dv.group is 'lower'
              lower = v
        if middle? and mergedGraph.edge u, lower
          mergedGraph.removeEdge u, lower


    groupColor =
      upper: '#6ff'
      middle: '#cf6'
      lower: '#fc6'
    color = d3.scale.category20()
    egm1 = egrid.core.egm()
      .contentsMargin 5
      .edgeInterpolate 'cardinal'
      .edgeTension 0.95
      .edgeWidth -> 3
      .edgeColor (u, v) ->
        if graph.get(u).community is graph.get(v).community
          color graph.get(u).community
        else
          '#ccc'
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
      .dagreRankSep 200
      .dagreEdgeSep 40
      .edgeInterpolate 'cardinal'
      .edgeTension 0.95
      .edgeWidth (u, v) -> 9
      .edgeColor (u, v) ->
        if mergedGraph.get(u).community is mergedGraph.get(v).community
          color mergedGraph.get(u).community
        else
          '#ccc'
      .edgeOpacity (u, v) ->
        du = mergedGraph.get u
        dv = mergedGraph.get v
        if du.selected and du.community is dv.community
          activeOpacity
        else
          inactiveOpacity
      .selectedStrokeColor 'black'
      .upperStrokeColor 'black'
      .lowerStrokeColor 'black'
      .maxTextLength 10
      .onClickVertex (d) ->
        for c in mergedGraph.vertices()
          dc = mergedGraph.get c
          if dc.community is d.community
            dc.selected = not dc.selected
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
      .vertexScale -> 3
      .vertexColor (d) ->
        if $scope.paint is 'layer'
          groupColor[d.group]
        else
          color d.community
      .vertexOpacity (d) ->
        if d.selected
          activeOpacity
        else
          inactiveOpacity
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
