module.exports = ->
  describe 'layout', ->
    it 'should return positions', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex {}
      b = graph.addVertex {}
      c = graph.addVertex {}
      d = graph.addVertex {}
      e = graph.addVertex {}
      f = graph.addVertex {}
      g = graph.addVertex {}
      h = graph.addVertex {}
      i = graph.addVertex {}
      j = graph.addVertex {}
      k = graph.addVertex {}
      l = graph.addVertex {}
      m = graph.addVertex {}
      n = graph.addVertex {}
      o = graph.addVertex {}
      for u in graph.vertices()
        graph.get(u).width = 100
        graph.get(u).height = 40
      graph.addEdge a, d
      graph.addEdge b, c
      graph.addEdge c, d
      graph.addEdge c, e
      graph.addEdge c, f
      graph.addEdge d, g
      graph.addEdge d, h
      graph.addEdge e, m
      graph.addEdge f, n
      graph.addEdge f, i
      graph.addEdge g, j
      graph.addEdge g, l
      graph.addEdge h, l
      graph.addEdge i, o
      graph.addEdge j, k

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

    describe 'normalize', ->
      it 'should return normalized graph', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        d = graph.addVertex()
        e = graph.addVertex()
        graph.addEdge a, c
        graph.addEdge a, d
        graph.addEdge b, c
        graph.addEdge b, e
        graph.addEdge c, d
        graph.addEdge c, e
        layers = {}
        layers[a] = 0
        layers[b] = 0
        layers[c] = 1
        layers[d] = 2
        layers[e] = 2
        normalizedGraph = egrid.core.layout.normalize graph, layers
        expect normalizedGraph.vertices().length
          .to.be 7
        expect normalizedGraph.edges().length
          .to.be 8

    describe 'cycleRemoval', ->
      it 'should remove cycle', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        graph.addEdge a, b
        graph.addEdge b, c
        graph.addEdge c, a
        egrid.core.layout.cycleRemoval graph
        expect graph.edge a, c
          .to.be.ok()
