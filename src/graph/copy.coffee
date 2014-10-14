adjacencyList = require './adjacency-list'

module.exports = (graph) ->
  newGraph = adjacencyList()
  for u in graph.vertices()
    newGraph.addVertex graph.get(u), u
  for [u, v] in graph.edges()
    newGraph.addEdge u, v
  newGraph
