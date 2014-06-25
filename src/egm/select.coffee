svg = require '../svg'
dijkstra = require '../graph/dijkstra'


createVertexButtons = (vertex, vertexButtons) ->
  vertexButtonWidth = 30
  vertexButtonHeight = 20
  vertexButtonMargin = 5

  (selection) ->
    button = selection
      .select 'g.contents'
      .append 'g'
      .classed 'vertex-buttons', true
      .attr
        transform: ->
          x = vertex.x - vertexButtonWidth * vertexButtons.length / 2
          y = vertex.y + vertex.height / 2 + vertexButtonMargin
          svg.transform.translate x, y
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


selectVertex = (container, u, vertexButtons=[]) ->
  graph = container.datum()
  spf = dijkstra()
    .weight -> 1
  descendants = d3.set()
  for v, dist of spf graph, u.key
    if dist < Infinity
      descendants.add v
  spf.inv true
  ancestors = d3.set()
  for v, dist of spf graph, u.key
    if dist < Infinity
      ancestors.add v

  container
    .selectAll 'g.vertex'
    .filter (d) -> d.key is u.key
    .classed 'selected', true
  if vertexButtons.length > 0
    container.call createVertexButtons(u, vertexButtons)
  container
    .selectAll 'g.edge'
    .classed
      upper: ({source, target}) ->
        ancestors.has(source.key) and ancestors.has(target.key)
      lower: ({source, target}) ->
        descendants.has(source.key) and descendants.has(target.key)
  ancestors.remove u
  descendants.remove u
  container
    .selectAll 'g.vertex'
    .classed
      upper: (v) -> ancestors.has v.key
      lower: (v) -> descendants.has v.key


unselectVertex = (container) ->
  container
    .selectAll 'g.vertex'
    .classed
      selected: false
      lower: false
      upper: false
  container
    .selectAll 'g.edge'
    .classed
      lower: false
      upper: false
  container
    .selectAll 'g.vertex-buttons'
    .remove()


selectedVertex = (container) ->
  container.selectAll 'g.vertex.selected'


module.exports =
  selectVertex: (container, u, vertexButtons=[]) ->
    selection = selectedVertex container
    unselectVertex container
    if selection.empty() or selection.datum().key isnt u.key
      selectVertex container, u, vertexButtons

  reset: (container, vertexButtons=[]) ->
    selection = selectedVertex container
    unselectVertex container
    unless selection.empty()
      selectVertex container, selection.datum(), vertexButtons
