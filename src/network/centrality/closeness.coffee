module.exports = (weight) ->
  warshallFloyd = require '../../graph/warshall-floyd'
  (graph) ->
    result = {}
    distances = warshallFloyd graph
    for u in graph.vertices()
      val = 0
      for v in graph.vertices()
        if u isnt v
          val += 1 / distances[u][v]
          val += 1 / distances[v][u]
      result[u] = val
    result
