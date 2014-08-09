dictFromKeys = (keys, value) ->
  result = {}
  for key in keys
    result[key] = value
  result


module.exports = (graph, options={}) ->
  alpha = options.alpha ? 0.1
  beta = options.beta ? 1.0
  maxIter = options.maxIter ? 1000
  tol = options.tol ? 1.0e-6
  normalized = options.normalized ? true
  nnodes = graph.numVertices()

  x = dictFromKeys graph.vertices(), 0
  b = dictFromKeys graph.vertices(), beta

  for i in [0...maxIter]
    xlast = x
    x = dictFromKeys graph.vertices(), 0

    for u of x
      for v in graph.adjacentVertices u
        x[v] += xlast[u]
      for v in graph.invAdjacentVertices u
        x[v] += xlast[u]
    for u of x
      x[u] = alpha * x[u] + b[u]

    err = graph.vertices().reduce ((e, u) -> e + Math.abs(x[u] - xlast[u])), 0
    if err < nnodes * tol
      break

  if normalized
    s = 1 / Math.sqrt(graph.vertices().reduce ((s, u) -> s + x[u] * x[u]), 0)
    for u of x
      x[u] *= s

  x
