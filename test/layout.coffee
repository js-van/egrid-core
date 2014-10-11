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

  describe 'layerAssignment', ->
    it 'should return layers', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex()
      b = graph.addVertex()
      c = graph.addVertex()
      d = graph.addVertex()
      e = graph.addVertex()
      graph.addEdge a, b
      graph.addEdge b, c
      graph.addEdge d, c
      graph.addEdge d, e
      layers = egrid.core.layout().layerAssignment graph
      expect(layers[a]).to.be 0
      expect(layers[b]).to.be 1
      expect(layers[c]).to.be 2
      expect(layers[d]).to.be 0
      expect(layers[e]).to.be 1
