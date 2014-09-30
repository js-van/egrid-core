module.exports = ->
  describe 'layout', ->
    it 'should return positions', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex
        width: 100
        height: 40
      b = graph.addVertex
        width: 100
        height: 40
      c = graph.addVertex
        width: 100
        height: 40
      d = graph.addVertex
        width: 100
        height: 40
      e = graph.addVertex
        width: 100
        height: 40
      graph.addEdge a, b
      graph.addEdge b, c
      graph.addEdge d, c
      graph.addEdge d, e

      layout = egrid.core.layout()

      pos = layout graph

      expect(pos.vertices[a]).to.eql
        x: 0
        y: 0
