adjacencyList = require '../graph/adjacency-list'

module.exports = (graph, layers) ->
  newGraph = adjacencyList()
  for u in graph.vertices()
    newGraph.addVertex layer: layers[u], u
  for [u, v] in graph.edges()
    source = u
    for layer in [layers[u] + 1...layers[v]]
      target = newGraph.addVertex
        layer: layer
      newGraph.addEdge source, target
      source = target
    newGraph.addEdge source, v
  newGraph
