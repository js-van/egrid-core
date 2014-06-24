module.exports = ->
  weight = (p) -> p.weight
  inv = false

  dijkstra = (graph, i) ->
    adjacentVertices =
      if inv
        (u) -> graph.invAdjacentVertices u
      else
        (u) -> graph.adjacentVertices u
    distances = {}
    for j of graph.vertices()
      distances[j] = Infinity
    distances[i] = 0
    queue = [i]
    while queue.length > 0
      u = queue.pop()
      for v in adjacentVertices u
        if distances[v] is Infinity
          queue.push(v)
        distance = distances[u] + weight graph.get u, v
        if distance < distances[v]
          distances[v] = distance
    distances

  dijkstra.weight = (f) ->
    if f?
      weight = f
      dijkstra
    else
      weight

  dijkstra.inv = (flag) ->
    if flag?
      inv = flag
      dijkstra
    else
      inv

  dijkstra
