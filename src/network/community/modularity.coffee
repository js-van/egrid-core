degree = require '../centrality/degree'

module.exports = (graph, communities) ->
  n = graph.numVertices()
  m = graph.numEdges()
  s = 0
  k = degree.degree graph
  for i in [0...n]
    for j in [0...n]
      if communities[i] is communities[j]
        s += if graph.edge(i, j) or graph.edge(j, i) then 1 else 0
        s -= k[i] * k[j] / 2 / m
  s / 2 / m
