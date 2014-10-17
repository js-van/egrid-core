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
    graph = egrid.core.graph.adjacencyList()
    for node in data.data.nodes
      node.visibility = true
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
    map = {}
    overallGraph = egrid.core.graph.copy graph
    for u in mergedGraph.vertices()
      du = mergedGraph.get u
      v = overallGraph.addVertex du
      map[u] = v
      for w in du.vertices
        overallGraph.get(w).parent = v
    for [u, v] in mergedGraph.edges()
      overallGraph.addEdge map[u], map[v]

    invisibleEdges = {}
    removeEdge = (u, v) ->
      if not invisibleEdges[u]?
        invisibleEdges[u] = {}
      invisibleEdges[u][v] = true
    for u in overallGraph.vertices()
      du = overallGraph.get u
      if du.vertices?
        if du.group is 'upper'
          middle = lower = null
          for v in overallGraph.adjacentVertices u
            dv = overallGraph.get v
            if dv.community is du.community
              if dv.group is 'middle'
                middle = v
              else if dv.group is 'lower'
                lower = v
          if middle? and overallGraph.edge u, lower
            removeEdge u, lower
    for [u, v] in egrid.core.graph.redundantEdges graph
      removeEdge u, v

    workGraph = egrid.core.graph.copy overallGraph
    for u in workGraph.vertices()
      du = workGraph.get u
      if not du.vertices?
        workGraph.clearVertex u
        workGraph.removeVertex u

    color = d3.scale.category20()
    egm = egrid.core.egm()
      .size [800, 800]
      .contentsMargin 5
      .dagreRankSep 200
      .dagreEdgeSep 40
      .edgeInterpolate 'cardinal'
      .edgeTension 0.95
      .edgeWidth (u, v) -> 9
      .edgeColor (u, v) ->
        if workGraph.get(u).community is workGraph.get(v).community
          color workGraph.get(u).community
        else
          '#ccc'
      .edgeVisibility (u, v) ->
        not invisibleEdges[u]? or not invisibleEdges[u][v]
      .selectedStrokeColor 'black'
      .upperStrokeColor 'black'
      .lowerStrokeColor 'black'
      .maxTextLength 10
      .vertexScale -> 3
      .vertexColor (d) -> color d.community
      .layerGroup (d) -> d.group
      .onClickVertex (d, u) ->
        if d.vertices?
          workGraph.clearVertex u
          workGraph.removeVertex u
          for v in d.vertices
            workGraph.addVertex overallGraph.get(v), v
          for v in d.vertices
            for w in overallGraph.adjacentVertices v
              if workGraph.vertex(w)?
                workGraph.addEdge v, w
              else
                workGraph.addEdge v, overallGraph.get(w).parent
            for w in overallGraph.invAdjacentVertices v
              if workGraph.vertex(w)?
                workGraph.addEdge w, v
              else
                workGraph.addEdge overallGraph.get(w).parent, v
        else
          parent = overallGraph.get d.parent
          for v in parent.vertices
            workGraph.clearVertex v
            workGraph.removeVertex v
          workGraph.addVertex parent, d.parent
          for v in parent.vertices
            for w in overallGraph.adjacentVertices v
              dw = overallGraph.get w
              if dw.parent isnt d.parent
                if workGraph.vertex w
                  workGraph.addEdge d.parent, w
                else
                  workGraph.addEdge d.parent, dw.parent
            for w in overallGraph.invAdjacentVertices v
              dw = overallGraph.get w
              if dw.parent isnt d.parent
                if workGraph.vertex w
                  workGraph.addEdge w, d.parent
                else
                  workGraph.addEdge dw.parent, d.parent

        display
          .transition()
          .delay 100
          .duration 300
          .call egm
    display = d3.select 'svg.display'
      .datum workGraph
      .call egm
      .call egm.center()
      .call d3.downloadable
        filename: 'egm'
        width: 800
        height: 800
