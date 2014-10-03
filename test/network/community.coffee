module.exports = ->
  describe 'modularity', ->
    it 'should return 0 if graph has one community', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex()
      b = graph.addVertex()
      c = graph.addVertex()
      graph.addEdge a, b
      graph.addEdge b, c
      communities = {}
      for u in graph.vertices()
        communities[u] = 0
      q = egrid.core.network.community.modularity graph, communities
      expect(q).to.be 0

  describe 'newman', ->
    it 'should return community labels', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex()
      b = graph.addVertex()
      c = graph.addVertex()
      d = graph.addVertex()
      e = graph.addVertex()
      f = graph.addVertex()
      graph.addEdge a, b
      graph.addEdge a, c
      graph.addEdge b, c
      graph.addEdge c, d
      graph.addEdge d, e
      graph.addEdge d, f
      graph.addEdge e, f
      communities = egrid.core.network.community.newman graph
      expect communities
        .to.be.eql [[0, 1, 2], [3, 4, 5]]

  describe 'reduce', ->
    it 'should return reduced graph', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex()
      b = graph.addVertex()
      c = graph.addVertex()
      d = graph.addVertex()
      e = graph.addVertex()
      f = graph.addVertex()
      graph.addEdge a, b
      graph.addEdge a, c
      graph.addEdge b, c
      graph.addEdge c, d
      graph.addEdge d, e
      graph.addEdge d, f
      graph.addEdge e, f
      reducedGraph = egrid.core.network.community.reduce graph
      expect reducedGraph.numVertices()
        .to.be 2
      expect reducedGraph.numEdges()
        .to.be 1

    it 'should return reduced graph', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex 'a'
      b = graph.addVertex 'b'
      c = graph.addVertex 'c'
      d = graph.addVertex 'd'
      e = graph.addVertex 'e'
      f = graph.addVertex 'f'
      graph.addEdge a, b
      graph.addEdge a, c
      graph.addEdge b, c
      graph.addEdge c, d
      graph.addEdge d, e
      graph.addEdge d, f
      graph.addEdge e, f
      reducedGraph = egrid.core.network.community.reduce graph, (vertices) ->
        vertices.map((u) -> graph.get u).join('')
      expect reducedGraph.get 0
        .to.be 'abc'
      expect reducedGraph.get 1
        .to.be 'def'

    it 'should return reduced graph', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex 'a'
      b = graph.addVertex 'b'
      c = graph.addVertex 'c'
      d = graph.addVertex 'd'
      e = graph.addVertex 'e'
      f = graph.addVertex 'f'
      graph.addEdge a, b
      graph.addEdge a, c
      graph.addEdge b, c
      graph.addEdge c, d
      graph.addEdge d, e
      graph.addEdge d, f
      graph.addEdge e, f
      reducedGraph = egrid.core.network.community.reduce graph, (vertices, c) ->
        if c is 0
          expect vertices
            .to.be.eql [0, 1, 2]
        else if c is 1
          expect vertices
            .to.be.eql [3, 4, 5]
