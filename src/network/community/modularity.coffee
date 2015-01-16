degree = require '../centrality/degree'

module.exports = (graph, communities) ->
  n = graph.numVertices()
  m = graph.numEdges()
  s = 0
  k = degree.degree graph
  for u in graph.vertices()
    for v in graph.vertices()
      if communities[u] is communities[v]
        s += if graph.edge(u, v) or graph.edge(v, u) then 1 else 0
        s -= k[u] * k[v] / 2 / m
  s / 2 / m
