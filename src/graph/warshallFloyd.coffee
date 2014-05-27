@egrid = {} unless egrid
@egrid.core = {} unless egrid.core
@egrid.core.graph = {} unless egrid.core.graph
graph = @egrid.core.graph

graph.warshallFloyd = ->
  weight= (p) -> p.weight

  warshallFloyd = (graph) ->
    distances = {}
    for u in graph.vertices()
      distances[u] = {}
      for v in graph.vertices()
        distances[u][v] = Infinity
      distances[u][u] = 0
      for v in graph.adjacentVertices u
        distances[u][v] = weight graph.get u, v
    for k in graph.vertices()
      for i in graph.vertices()
        for j in graph.vertices()
          distance = distances[i][k] + distances[k][j]
          if distance < distances[i][j]
            distances[i][j] = distance
    distances

  warshallFloyd.weight = (f) ->
    if f?
      weight = f
      warshallFloyd
    else
      weight

  warshallFloyd
