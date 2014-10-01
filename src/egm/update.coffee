svg = require '../svg'
select = require './select'


onClickVertex = ({container, vertexButtons, clickVertexCallback}) ->
  (vertex) ->
    vertex.selected = not vertex.selected
    container.call select vertexButtons
    clickVertexCallback()
    return


onMouseEnterVertex = ->
  (vertex) ->
    d3.select @
      .selectAll 'tspan'
      .text (d) -> d.originalText


onMouseLeaveVertex = ->
  (vertex) ->
    d3.select @
      .selectAll 'tspan'
      .transition()
      .delay 1000
      .text (d) -> d.text


calculateTextSize = () ->
  (selection) ->
    measure = d3
      .select 'body'
      .append 'svg'
    measureText = measure
      .append 'text'
      .style
        'font-family': """'Lucida Grande', 'Hiragino Kaku Gothic ProN',
          'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif"""
        'font-size': '14px'
    selection.each (d) ->
      measureText
        .selectAll 'tspan'
        .remove()
      measureText
        .selectAll 'tspan'
        .data d.texts
        .enter()
        .append 'tspan'
        .text (t) -> t.text
        .attr
          x: 0
          dy: 20
      bbox = measureText.node().getBBox()
      d.textWidth = bbox.width
      d.textHeight = bbox.height
    measure.remove()


createVertex = () ->
  (selection) ->
    selection.append 'rect'
    selection
      .append 'text'
      .each (u) ->
        u.x = 0
        u.y = 0
        u.selected = false


updateVertices = (arg) ->
  r = 5
  strokeWidth = 1
  {vertexScale} = arg

  (selection) ->
    selection
      .enter()
      .append 'g'
      .classed 'vertex', true
      .call createVertex()
    selection
      .exit()
      .remove()
    selection
      .call calculateTextSize()
      .each (u) ->
        u.originalWidth = u.textWidth + 2 * r
        u.originalHeight = u.textHeight + 2 * r
        u.scale = vertexScale u.data, u.key
        u.width = (u.originalWidth + strokeWidth) * u.scale
        u.height = (u.originalHeight + strokeWidth) * u.scale
    selection
      .select 'text'
      .attr 'y', (d) -> -d.textHeight / 2 - 20
      .each (d) ->
        innerSelection = d3.select @
        updateSelection = innerSelection
          .selectAll 'tspan'
          .data d.texts
        updateSelection
          .enter()
          .append 'tspan'
          .attr
            'text-anchor': 'left'
            'dominant-baseline': 'text-before-edge'
        updateSelection
          .exit()
          .remove()
        innerSelection
          .selectAll 'tspan'
          .text (t) -> t.text
          .attr
            x: -d.textWidth / 2
            dy: 20
    selection
      .select 'rect'
      .attr
        x: (u) -> -u.originalWidth / 2
        y: (u) -> -u.originalHeight / 2
        width: (u) -> u.originalWidth
        height: (u) -> u.originalHeight
        rx: r


updateEdges = (arg) ->
  {edgeText, edgePointsSize, edgeLine} = arg
  (selection) ->
    edge = selection
      .enter()
      .append 'g'
      .classed 'edge', true
    edge
      .append 'path'
      .attr 'd', ({source, target}) ->
        points = []
        points.push [source.x, source.y]
        for i in [1..edgePointsSize]
          points.push [target.x, target.y]
        edgeLine points
    edge
      .append 'text'
    selection
      .exit()
      .remove()
    selection
      .select 'text'
      .text ({source, target}) -> edgeText source.key, target.key


makeGrid = (graph, arg) ->
  {pred, oldVertices, vertexText, maxTextLength} = arg
  oldVerticesMap = {}
  for u in oldVertices
    oldVerticesMap[u.key] = u
  vertices = graph
    .vertices()
    .filter pred
    .map (u) ->
      if oldVerticesMap[u]?
        oldVerticesMap[u].data = graph.get u
        oldVerticesMap[u]
      else
        key: u
        data: graph.get u
  for vertex in vertices
    vertex.texts = vertexText vertex.data
      .split '\n'
      .map (text) ->
        originalText = text
        if text.length > maxTextLength
          text = "#{text.slice 0, maxTextLength - 1}..."
        text: text
        originalText: originalText
  verticesMap = {}
  for u in vertices
    verticesMap[u.key] = u
  edges = []
  for u in graph.vertices()
    if pred u
      for v in graph.adjacentVertices u
        if pred v
          edges.push
            source: verticesMap[u]
            target: verticesMap[v]
    else
      for v in graph.adjacentVertices u
        for w in graph.invAdjacentVertices u
          if (pred v) and (pred w)
            edges.push
              source: verticesMap[w]
              target: verticesMap[v]
  vertices: vertices, edges: edges


initContainer = (zoom) ->
  (selection) ->
    contents = selection.select 'g.contents'
    if contents.empty()
      selection
        .append 'rect'
        .classed 'background', true
      contents = selection
        .append 'g'
        .classed 'contents', true
      contents
        .append 'g'
        .classed 'edges', true
      contents
        .append 'g'
        .classed 'vertices', true
      zoom.on 'zoom', ->
        e = d3.event
        t = svg.transform.translate e.translate[0], e.translate[1]
        s = svg.transform.scale e.scale
        contents.attr 'transform', svg.transform.compose(t, s)
    return


module.exports = (graph, arg) ->
  {edgeText,
   vertexScale, vertexText, vertexVisibility,
   enableZoom, zoom, maxTextLength,
   edgePointsSize, edgeLine,
   vertexButtons,
   clickVertexCallback} = arg

  (selection) ->
    if graph?
      selection.call initContainer zoom
      contents = selection.select 'g.contents'
      if enableZoom
        selection
          .select 'rect.background'
          .call zoom
      else
        selection
          .select 'rect.background'
          .on '.zoom', null

      {vertices, edges} = makeGrid graph,
        pred: (u) -> vertexVisibility (graph.get u), u
        oldVertices: selection.selectAll('g.vertex').data()
        vertexText: vertexText
        maxTextLength: maxTextLength

      contents
        .select 'g.vertices'
        .selectAll 'g.vertex'
        .data vertices, (u) -> u.key
        .call updateVertices
          vertexScale: vertexScale
        .on 'click', onClickVertex
          container: selection
          vertexButtons: vertexButtons
          clickVertexCallback: clickVertexCallback
        .on 'mouseenter', onMouseEnterVertex()
        .on 'mouseleave', onMouseLeaveVertex()
        .on 'touchstart', onMouseEnterVertex()
        .on 'touchmove', -> d3.event.preventDefault()
        .on 'touchend', onMouseLeaveVertex()
      contents
        .select 'g.edges'
        .selectAll 'g.edge'
        .data edges, ({source, target}) -> "#{source.key}:#{target.key}"
        .call updateEdges
          edgeText: edgeText
          edgePointsSize: edgePointsSize
          edgeLine: edgeLine
    else
      selection
        .select 'g.contents'
        .remove()
