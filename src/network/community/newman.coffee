degree = require '../centrality/degree'
modularity = require './modularity'

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
    ck = {}
    for c, community of communities
      sum = 0
      for u in community.values()
        sum += k[u]
      ck[c] = sum
    nb = {}
    for c1 of communities
      nb[c1] = {}
      for c2 of communities
        nb[c1][c2] = 0
    for [u, v] in graph.edges()
      nb[vertexCommunity[u]][vertexCommunity[v]] += 1
      nb[vertexCommunity[v]][vertexCommunity[u]] += 1
    keys = Object.keys communities
    deltaQMax = - Infinity
    maxU
    maxV
    for i in [0...nc]
      for j in [i + 1...nc]
        deltaQ = (nb[keys[i]][keys[j]] - ck[keys[i]] * ck[keys[j]] / 2 / m) / m
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
