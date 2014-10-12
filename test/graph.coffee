module.exports = ->
  describe 'AdjacencyList', ->
    describe 'adjacencyList()', ->
      it 'should make empty graph', ->
        graph = egrid.core.graph.adjacencyList()
        expect graph.numVertices()
          .to.be 0
        expect graph.numEdges()
          .to.be 0

    describe 'inEdges(u)', ->
      it 'should return edges to u', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        ab = graph.addEdge a, b
        ca = graph.addEdge c, a
        expect graph.inEdges a
          .to.have.length 1
        expect graph.inEdges(a)[0]
          .to.eql ca

    describe 'outEdges(u)', ->
      it 'should return edges from u', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        ab = graph.addEdge a, b
        ca = graph.addEdge c, a
        expect graph.outEdges a
          .to.have.length 1
        expect graph.outEdges(a)[0]
          .to.eql ab

    describe 'numVertices()', ->
      it 'should return number of vertices of graph', ->
        graph = egrid.core.graph.adjacencyList()
        expect graph.numVertices()
          .to.be 0
        graph.addVertex()
        expect graph.numVertices()
          .to.be 1
        graph.addVertex()
        expect graph.numVertices()
          .to.be 2
        graph.addVertex()
        expect graph.numVertices()
          .to.be 3

    describe 'numEdges()', ->
      it 'should return number of edges of graph', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        expect graph.numEdges()
          .to.be 0
        graph.addEdge a, b
        expect graph.numEdges()
          .to.be 1
        graph.addEdge a, c
        expect graph.numEdges()
          .to.be 2
        graph.addEdge b, c
        expect graph.numEdges()
          .to.be 3

    describe 'addVertex()', ->
      it 'should add vertex to graph', ->
        graph = egrid.core.graph.adjacencyList()
        graph.addVertex()
        graph.addVertex()
        graph.addVertex()
        expect graph.numVertices()
          .to.be 3
        expect graph.numEdges()
          .to.be 0

    describe 'addEdge()', ->
      it 'should add edge to graph', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        graph.addEdge a, b
        graph.addEdge a, c
        graph.addEdge b, c
        expect graph.numVertices()
          .to.be 3
        expect graph.numEdges()
          .to.be 3

    describe 'clearVertex()', ->
      it 'should remove all edges to and from vertex', ->
        graph = egrid.core.graph.adjacencyList()
        a = graph.addVertex()
        b = graph.addVertex()
        c = graph.addVertex()
        graph.addEdge a, b
        graph.addEdge c, a
        graph.clearVertex a
        expect graph.numVertices()
          .to.be 3
        expect graph.numEdges()
          .to.be 0

    describe 'get()', ->
      it 'should return property of edge', ->
        graph = egrid.core.graph.adjacencyList()
        u = graph.addVertex
          text: 'TEXT'
        expect graph.get(u).text
          .to.be 'TEXT'

    describe 'set()', ->
      it 'should set property of edge', ->
        graph = egrid.core.graph.adjacencyList()
        u = graph.addVertex
          text: 'TEXT'
        expect graph.get(u).text
          .to.be 'TEXT'
        graph.set u,
          text: 'NEW TEXT'
        expect graph.get(u).text
          .to.be 'NEW TEXT'

  describe 'copy', ->
    it 'should copy graph', ->
      graph = egrid.core.graph.adjacencyList()
      a = graph.addVertex 'a'
      b = graph.addVertex 'b'
      c = graph.addVertex 'c'
      graph.addEdge a, b
      graph.addEdge c, a
      newGraph = egrid.core.graph.copy graph
      for u in graph.vertices()
        expect newGraph.get u
          .to.eql graph.get u
      for [u, v] in graph.edges()
        expect newGraph.edge u, v
          .to.be.ok()
