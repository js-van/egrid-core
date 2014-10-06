svg = require '../svg'
select = require './select'
adjacencyList = require '../graph/adjacency-list'


onClickVertex = ({container, vertexButtons, clickVertexCallback}) ->
  (vertex) ->
    vertex.selected = not vertex.selected
    container.call select vertexButtons
    clickVertexCallback.bind(@) vertex.data, vertex.key
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
  {vertexFontWeight,
   vertexScale,
   vertexStrokeWidth} = arg

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
      .each (d) ->
        d.originalWidth = d.textWidth + 2 * r
        d.originalHeight = d.textHeight + 2 * r
        d.scale = vertexScale d.data, d.key
        d.strokeWidth = vertexStrokeWidth d.data, d.key
        d.width = (d.originalWidth + d.strokeWidth) * d.scale
        d.height = (d.originalHeight + d.strokeWidth) * d.scale
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
            'font-weight': vertexFontWeight d.data, d.key
    selection
      .select 'rect'
      .attr
        x: (d) -> -d.originalWidth / 2
        y: (d) -> -d.originalHeight / 2
        width: (d) -> d.originalWidth
        height: (d) -> d.originalHeight
        rx: r
        'stroke-width': (d) -> d.strokeWidth


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
  {maxTextLength,
   oldVertices,
   pred,
   textSeparator,
   vertexText} = arg
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
    vertex.texts = textSeparator vertexText vertex.data
      .map (text) ->
        originalText = text
        if text.length > maxTextLength
          text = "#{text.slice 0, maxTextLength - 1}..."
        text: text
        originalText: originalText

  verticesMap = {}
  for u in vertices
    verticesMap[u.key] = u
  tmpGraph = adjacencyList()
  for u in graph.vertices()
    tmpGraph.addVertex {}, u
  for [u, v] in graph.edges()
    tmpGraph.addEdge u, v
  for u in tmpGraph.vertices()
    if not pred u
      for v in tmpGraph.adjacentVertices u
        for w in tmpGraph.invAdjacentVertices u
          tmpGraph.addEdge w, v
      tmpGraph.clearVertex u
  edges = tmpGraph.edges().map ([u, v]) ->
    source: verticesMap[u]
    target: verticesMap[v]

  vertices: vertices
  edges: edges


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
  {clickVertexCallback,
   edgeLine,
   edgePointsSize,
   edgeText,
   enableZoom,
   maxTextLength,
   textSeparator,
   vertexButtons,
   vertexFontWeight,
   vertexScale,
   vertexStrokeWidth,
   vertexText,
   vertexVisibility,
   zoom} = arg

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
        maxTextLength: maxTextLength
        oldVertices: selection.selectAll('g.vertex').data()
        pred: (u) -> vertexVisibility (graph.get u), u
        textSeparator: textSeparator
        vertexText: vertexText

      contents
        .select 'g.vertices'
        .selectAll 'g.vertex'
        .data vertices, (u) -> u.key
        .call updateVertices
          vertexFontWeight: vertexFontWeight
          vertexScale: vertexScale
          vertexStrokeWidth: vertexStrokeWidth
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
