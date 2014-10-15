warshallFloyd = require './warshall-floyd'

module.exports = (graph) ->
  solver = warshallFloyd()
    .weight -> -1
  distances = solver graph

  result = []
  for [u, v] in graph.edges()
    if distances[u][v] < -1
      result.push [u, v]
  result
