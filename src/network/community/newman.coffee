degree = require '../centrality/degree'
modularity = require './modularity'

numBridges = (graph, community1, community2) ->
  nb = 0
  for u in community1
    for v in community2
      if graph.edge(u, v) or graph.edge(v, u)
        nb += 1
  nb

cleanupLabel = (vertexCommunity) ->
  result = {}
  for u, c of vertexCommunity
    if result[c] is undefined
      result[c] = []
    result[c].push +u
  (vertices for c, vertices of result)

module.exports = (graph) ->
  n = graph.numVertices()
  m = graph.numEdges()
  k = degree.degree graph

  communities = {}
  vertexCommunity = {}
  for u in graph.vertices()
    communities[u] = d3.set [u]
    vertexCommunity[u] = u

  qMax = - Infinity
  result = {}
  for nc in [n...1]
    ck ={}
    for c, community of communities
      sum = 0
      for u in community.values()
        sum += k[u]
      ck[c] = sum
    keys = Object.keys communities
    deltaQMax = - Infinity
    maxU
    maxV
    for i in [0...nc]
      for j in [i + 1...nc]
        nb = numBridges graph,
                        communities[keys[i]].values(),
                        communities[keys[j]].values()
        deltaQ = nb / m - ck[keys[i]] * ck[keys[j]] / 2 / m / m
        if deltaQ > deltaQMax
          deltaQMax = deltaQ
          maxU = keys[i]
          maxV = keys[j]
    for u in communities[maxV].values()
      communities[maxU].add u
      vertexCommunity[u] = +maxU
    delete communities[maxV]
    q = modularity graph, vertexCommunity
    if q > qMax
      qMax = q
      for u, c of vertexCommunity
        result[u] = c
  cleanupLabel result
