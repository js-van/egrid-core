@egrid = {} unless egrid
@egrid.core = {} unless egrid.core
@egrid.core.network = {} unless egrid.core.network
@egrid.core.network.centrality = {} unless egrid.core.network.centrality
centrality = @egrid.core.network.centrality

centrality.inDegree = (graph) ->
  graph.inDegree(u) for u in graph.vertices()

centrality.outDegree = (graph) ->
  graph.outDegree(u) for u in graph.vertices()

centrality.degree = (graph) ->
  graph.inDegree(u) + graph.outDegree(u) for u in graph.vertices()
