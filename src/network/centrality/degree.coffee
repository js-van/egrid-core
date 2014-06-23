module.exports =
  inDegree: (graph) ->
    result = {}
    for u in graph.vertices()
      result[u] = graph.inDegree u
    result

  outDegree: (graph) ->
    result = {}
    for u in graph.vertices()
      result[u] = graph.outDegree u
    result

  degree: (graph) ->
    result = {}
    for u in graph.vertices()
      result[u] = (graph.outDegree u) + (graph.inDegree u)
    result
