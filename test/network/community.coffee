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
