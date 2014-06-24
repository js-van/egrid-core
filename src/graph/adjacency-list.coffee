module.exports = (v, e) ->
  nextVertexId = 0
  vertices = {}

  class AdjacencyList
    constructor: (vertices=[], edges=[]) ->
      for vertex in vertices
        @addVertex vertex
      for {source, target} in edges
        @addEdge source, target

    vertices: -> u for u of vertices

    edges: -> [].concat (@outEdges u for u in @vertices())...

    adjacentVertices: (u) -> v for v of vertices[u].outAdjacencies

    invAdjacentVertices: (u) -> v for v of vertices[u].inAdjacencies

    outEdges: (u) -> [u, v] for v of vertices[u].outAdjacencies

    inEdges: (u) -> [v, u] for v in vertices[u].inAdjacencies

    outDegree: (u) -> Object.keys(vertices[u].outAdjacencies).length

    inDegree: (u) -> Object.keys(vertices[u].inAdjacencies).length

    numVertices: -> Object.keys(vertices).length

    numEdges: ->
      (@outDegree(i) for i in @vertices()).reduce ((t, s) -> t + s), 0

    vertex: (u) -> u

    edge: (u, v) -> vertices[u].outAdjacencies[v]?

    addEdge: (u, v, prop={}) ->
      vertices[u].outAdjacencies[v] = prop
      vertices[v].inAdjacencies[u] = prop
      [u, v]

    removeEdge: (u, v) ->
      delete vertices[u].outAdjacencies[v]
      delete vertices[v].inAdjacencies[u]
      return

    addVertex: (prop) ->
      vertices[nextVertexId] =
        outAdjacencies: {}
        inAdjacencies: {}
        property: prop
      nextVertexId++

    clearVertex: (u) ->
      vertices[u].outAdjacencies = {}
      outAdjacencies[i] = {}
      for v of vertices[u].inAdjacencies
        delete vertices[v].inAdjacencies[u]
      return

    removeVertex: (u) ->
      delete vertices[u]
      return

    get: (u, v) ->
      if v?
        vertices[u].outAdjacencies[v]
      else
        vertices[u].property

  new AdjacencyList v, e
