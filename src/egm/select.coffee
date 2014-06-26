svg = require '../svg'
dijkstra = require '../graph/dijkstra'


updateButtons = (vertexButtons) ->
  vertexButtonWidth = 30
  vertexButtonHeight = 20
  vertexButtonMargin = 5

  (container) ->
    vertices = container
      .selectAll 'g.vertex'
      .filter (vertex) -> vertex.selected
      .data()
    selection = container
      .select 'g.contents'
      .selectAll 'g.vertex-buttons'
      .data vertices, (vertex) -> vertex.key
    selection
      .enter()
      .append 'g'
      .each (vertex) ->
        button = d3.select @
          .classed 'vertex-buttons', true
          .selectAll 'g.vertex-button'
          .data vertexButtons
          .enter()
          .append 'g'
          .classed 'vertex-button', true
          .attr
            transform: (d, i) ->
              svg.transform.translate vertexButtonWidth * i, 0
          .on 'mouseenter', ->
            d3.select @
              .classed 'hover', true
          .on 'mouseleave', ->
            d3.select @
              .classed 'hover', false
          .on 'click', (d) ->
            d.onClick vertex.data, vertex.key
        button
          .append 'rect'
          .attr
            width: vertexButtonWidth
            height: vertexButtonHeight
        button
          .filter (d) -> d.icon?
          .append 'image'
          .attr
            x: vertexButtonWidth / 2 - 8
            y: vertexButtonHeight / 2 - 8
            width: '16px'
            height: '16px'
            'xlink:href': (d) -> d.icon
    selection
      .exit()
      .remove()
    container
      .selectAll 'g.vertex-buttons'
      .attr
        transform: (vertex) ->
          x = vertex.x - vertexButtonWidth * vertexButtons.length / 2
          y = vertex.y + vertex.height / 2 + vertexButtonMargin
          svg.transform.translate x, y
    return


updateSelectedVertex = ->
  (container) ->
    graph = container.datum()
    spf = dijkstra()
      .weight -> 1

    verticesSelection = container
      .selectAll 'g.vertex'
      .each (vertex) -> vertex.upper = vertex.lower = false
    descendants = d3.set()
    ancestors = d3.set()
    verticesSelection
      .filter (vertex) -> vertex.selected
      .each (vertex) ->
        spf.inv false
        for v, dist of spf graph, vertex.key
          if dist < Infinity
            descendants.add v
        spf.inv true
        for v, dist of spf graph, vertex.key
          if dist < Infinity
            ancestors.add v
        return
    for vertex in verticesSelection.data()
      vertex.upper = ancestors.has vertex.key
      vertex.lower = descendants.has vertex.key
    verticesSelection
      .classed
        selected: (vertex) -> vertex.selected
        upper: (vertex) -> vertex.upper
        lower: (vertex) -> vertex.lower
    container.selectAll 'g.edge'
      .classed
        upper: ({source, target}) -> source.upper and target.upper
        lower: ({source, target}) -> source.lower and target.lower
    return


module.exports = (vertexButtons) ->
  (container) ->
    container
      .call updateSelectedVertex()
      .call updateButtons vertexButtons
    return
