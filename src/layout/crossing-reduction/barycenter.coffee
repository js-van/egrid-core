module.exports = (graph, vertices1, vertices2) ->
  positions = {}
  for u, i in vertices1
    positions[u] = i
  adj = {}
  for u in vertices2
    adj[u] = []
    for v in vertices1
      if graph.edge v, u
        adj[u].push v
  barycenter = {}
  for u in vertices2
    sum = 0
    for v in adj[u]
      sum += positions[v]
    barycenter[u] = sum / adj[u].length
  result = vertices2[0...vertices2.length]
  result.sort (u, v) -> barycenter[u] - barycenter[v]
  result
