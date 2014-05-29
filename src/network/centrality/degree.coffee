@egrid = @egrid || {}
@egrid.core = @egrid.core || {}
@egrid.core.network = @egrid.core.network || {}
@egrid.core.network.centrality = centrality = @egrid.core.network.centrality || {}

centrality.inDegree = (graph) ->
  result = {}
  for u in graph.vertices()
    result[u] = graph.inDegree u
  result

centrality.outDegree = (graph) ->
  result = {}
  for u in graph.vertices()
    result[u] = graph.outDegree u
  result

centrality.degree = (graph) ->
  result = {}
  for u in graph.vertices()
    result[u] = (graph.outDegree u) + (graph.inDegree u)
  result
