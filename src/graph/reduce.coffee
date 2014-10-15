adjacencyList = require './adjacency-list'

module.exports = (graph, groups, f) ->
  mergedGraph = adjacencyList()
  for vertices, i in groups
    mergedData = f vertices, i
    mergedGraph.addVertex mergedData

  for vertices1, i in groups
    for j in [i + 1...groups.length]
      vertices2 = groups[j]
      for u in vertices1
        for v in vertices2
          s = null
          t = null
          if graph.edge u, v
            s = i
            t = j
          else if graph.edge v, u
            s = j
            t = i
          if s? and t?
            if mergedGraph.edge s, t
              mergedGraph.get(s, t).weight += 1
            else
              mergedGraph.addEdge s, t,
                weight: 1

  mergedGraph
