module.exports = (graph) ->
  stack = {}
  visited = {}
  result = []

  dfs = (u) ->
    if visited[u]
      return
    visited[u] = true
    stack[u] = true
    for v in graph.adjacentVertices u
      if stack[v]
        result.push [u, v]
      else
        dfs v
    delete stack[u]

  for u in graph.vertices()
    dfs u

  for [u, v] in result
    graph.removeEdge u, v
    graph.addEdge v, u
