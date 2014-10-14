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
          if graph.edge u, v
            mergedGraph.addEdge i, j
          else if graph.edge v, u
            mergedGraph.addEdge j, i

  mergedGraph
