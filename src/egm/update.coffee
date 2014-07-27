svg = require '../svg'
select = require './select'


onClickVertex = ({container, vertexButtons, clickVertexCallback}) ->
  (vertex) ->
    vertex.selected = not vertex.selected
    container.call select vertexButtons
    clickVertexCallback()
    return


onMouseEnterVertex = (vertexText) ->
  (vertex) ->
    d3.select @
      .select 'text'
      .text vertexText vertex.data


onMouseLeaveVertex = ->
  (vertex) ->
    d3.select @
      .select 'text'
      .transition()
      .delay 1000
      .text vertex.text


calculateTextSize = () ->
  (selection) ->
    measure = d3
      .select 'body'
      .append 'svg'
    measureText = measure.append 'text'
    selection.each (u) ->
      measureText.text u.text
      bbox = measureText.node().getBBox()
      u.textWidth = bbox.width
      u.textHeight = bbox.height
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
      .attr
        'text-anchor': 'left'
        'dominant-baseline': 'text-before-edge'


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
        u.scale = vertexScale u.data
        u.width = (u.originalWidth + strokeWidth) * u.scale
        u.height = (u.originalHeight + strokeWidth) * u.scale
    selection
      .select 'text'
      .text (u) -> u.text
      .attr
        x: (u) -> -u.textWidth / 2
        y: (u) -> -u.textHeight / 2
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
      .text ({source, target}) ->
        edgeText source.key, target.key
    selection
      .exit()
      .remove()


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
        oldVerticesMap[u]
      else
        key: u
        data: graph.get u
  for vertex in vertices
    text = vertexText vertex.data
    if text.length > maxTextLength
      vertex.text = "#{text.slice 0, maxTextLength}..."
    else
      vertex.text = text
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


module.exports = (arg) ->
  {edgeText,
   vertexScale, vertexText, vertexVisibility,
   enableZoom, zoom, maxTextLength,
   edgePointsSize, edgeLine,
   vertexButtons,
   clickVertexCallback} = arg

  (selection) ->
    selection
      .each (graph) ->
        container = d3.select this
        if graph?
          container.call initContainer zoom
          contents = container.select 'g.contents'
          if enableZoom
            container
              .select 'rect.background'
              .call zoom
          else
            container
              .select 'rect.background'
              .on '.zoom', null

          {vertices, edges} = makeGrid graph,
            pred: (u) -> vertexVisibility (graph.get u), u
            oldVertices: container.selectAll('g.vertex').data()
            vertexText: vertexText
            maxTextLength: maxTextLength

          contents
            .select 'g.vertices'
            .selectAll 'g.vertex'
            .data vertices, (u) -> u.key
            .call updateVertices
              vertexScale: vertexScale
            .on 'click', onClickVertex
              container: container
              vertexButtons: vertexButtons
              clickVertexCallback: clickVertexCallback
            .on 'mouseenter', onMouseEnterVertex vertexText
            .on 'mouseleave', onMouseLeaveVertex()
            .on 'touchstart', onMouseEnterVertex vertexText
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
          container
            .select 'g.contents'
            .remove()
