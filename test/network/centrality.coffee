egrid = core: require '../../'

module.exports = ->
  describe 'network', ->
    describe 'centrality', ->
      describe 'katz', ->
        it 'should return Katz centrality', ->
          graph = egrid.core.graph.adjacencyList()
          a = graph.addVertex()
          b = graph.addVertex()
          c = graph.addVertex()
          d = graph.addVertex()
          graph.addEdge a, b
          graph.addEdge b, c
          graph.addEdge c, d

          centrality = egrid.core.network.centrality.katz graph,
            alpha: 2 / (1 + Math.sqrt(5)) - 0.01

          expect(centrality[a].toFixed(2)).to.be '0.37'
          expect(centrality[b].toFixed(2)).to.be '0.60'
          expect(centrality[c].toFixed(2)).to.be '0.60'
          expect(centrality[d].toFixed(2)).to.be '0.37'
