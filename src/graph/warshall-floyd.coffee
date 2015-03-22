wfModule = require 'wf-asm'

module.exports = ->
  weight= (p) -> p.weight

  if Math.imul?
    warshallFloyd = (graph) ->
      n = graph.numVertices()
      indices = {}
      invIndices = {}
      for u, i in graph.vertices()
        indices[u] = i
        invIndices[i] = u

      size = 1
      while size < n * n * 4
        size <<= 1
      heap = new ArrayBuffer size
      matrix = new Uint32Array heap, 0, n * n
      for [u, v] in graph.edges()
        matrix[indices[u] * n + indices[v]] = weight graph.get(u, v)
      module = wfModule window, null, heap
      module.warshallFloyd n

      result = {}
      for u in graph.vertices()
        result[u] = {}
      for u in graph.vertices()
        for v in graph.vertices()
          result[u][v] = matrix[indices[u] * n + indices[v]]
      result
  else
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
