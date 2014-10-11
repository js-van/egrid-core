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

      layout = egrid.core.layout.layout()

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
      layers = egrid.core.layout.layerAssignment graph
      expect(layers[a]).to.be 0
      expect(layers[b]).to.be 1
      expect(layers[c]).to.be 2
      expect(layers[d]).to.be 0
      expect(layers[e]).to.be 1

  describe 'crossingReduction', ->
    describe 'cross', ->
      it 'should return number of crosses', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        d = graph.addVertex()
        e = graph.addVertex()
        f = graph.addVertex()
        g = graph.addVertex()
        graph.addEdge a, f
        graph.addEdge b, f
        graph.addEdge b, g
        graph.addEdge c, e
        graph.addEdge c, g
        graph.addEdge d, f
        expect egrid.core.layout.crossingReduction.cross(graph,
                                                         [a, b, c, d],
                                                         [e, f, g])
          .to.be 5

    describe 'barycenter', ->
      it 'should return ordered vertices', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        d = graph.addVertex()
        e = graph.addVertex()
        f = graph.addVertex()
        g = graph.addVertex()
        graph.addEdge a, f
        graph.addEdge b, f
        graph.addEdge b, g
        graph.addEdge c, e
        graph.addEdge c, g
        graph.addEdge d, f
        expect egrid.core.layout.crossingReduction.barycenter(graph,
                                                              [a, b, c, d],
                                                              [e, f, g])
          .to.eql [f, g, e]
