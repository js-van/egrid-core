module.exports = (graph) ->
  layers = {}
  source = graph.vertices().filter (u) ->
    graph.invAdjacentVertices(u).length is 0
  queue = []
  for u in source
    layers[u] = 0
    queue.push u
  while queue.length > 0
    u = queue.shift()
    for v in graph.adjacentVertices u
      if layers[v] is undefined or layers[v] < layers[u] + 1
        layers[v] = layers[u] + 1
      queue.push v
  layers
