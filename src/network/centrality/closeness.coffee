@egrid = @egrid || {}
@egrid.core = @egrid.core || {}
@egrid.core.network = @egrid.core.network || {}
@egrid.core.network.centrality = centrality = @egrid.core.network.centrality || {}

centrality.closeness = (weight) ->
  warshallFloyd = egrid.core.graph.warshallFloyd().weight weight
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
