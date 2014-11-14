adjacencyList = require './adjacency-list'

module.exports = (graph, vpred=(-> true), epred=(-> true)) ->
  vertices = graph.vertices()
  data = {}
  vflags = {}
  for u in vertices
    data[u] = graph.get u
    vflags[u] = vpred data[u], u

  newGraph = adjacencyList()
  for u in vertices
    newGraph.addVertex data[u], u
  for [u, v] in graph.edges()
    if epred u, v
      newGraph.addEdge u, v
  for u in vertices
    if not vflags[u]
      for v in newGraph.adjacentVertices u
        for w in newGraph.invAdjacentVertices u
          newGraph.addEdge w, v
      newGraph.clearVertex u
  for u in graph.vertices()
    if not vflags[u]
      newGraph.removeVertex u

  newGraph
