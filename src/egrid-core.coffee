@egrid = {} unless @egrid
@egrid.core = {} unless @egrid.core


edgeLine = d3.svg.line().interpolate('monotone')
edgePointsSize = 20


onClickVertex = (arg) ->
  {container, graph} = arg
  (u) ->
    alreadySelected = d3
      .select @
      .classed 'selected'
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

    if not alreadySelected
      dijkstra = egrid.core.graph.dijkstra()
        .weight -> 1
      descendants = d3.set()
      for v, dist of dijkstra graph, u.key
        if dist < Infinity
          descendants.add(v)
      dijkstra.inv true
      ancestors = d3.set()
      for v, dist of dijkstra graph, u.key
        if dist < Infinity
          ancestors.add(v)

      d3
        .select @
        .classed 'selected', true
      container
        .selectAll 'g.edge'
        .classed
          upper: ({source, target}) -> ancestors.has(source.key) and ancestors.has(target.key)
          lower: ({source, target}) -> descendants.has(source.key) and descendants.has(target.key)
      ancestors.remove(u)
      descendants.remove(u)
      container
        .selectAll 'g.vertex'
        .classed
          upper: (v) -> ancestors.has(v.key)
          lower: (v) -> descendants.has(v.key)


calculateTextSize = (vertexText) ->
  (selection) ->
    measure = d3
      .select 'body'
      .append 'svg'
    measureText = measure.append 'text'
    selection.each (u) ->
      measureText.text vertexText u.data
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
      .attr
        'text-anchor': 'middle'
        'dominant-baseline': 'text-before-edge'


updateVertices = (arg) ->
  r = 5
  strokeWidth = 1
  {vertexScale, vertexText} = arg

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
      .call calculateTextSize vertexText
      .each (u) ->
        u.originalWidth = u.textWidth + 2 * r
        u.originalHeight = u.textHeight + 2 * r
        u.scale = vertexScale u.data
        u.width = (u.originalWidth + strokeWidth) * u.scale
        u.height = (u.originalHeight + strokeWidth) * u.scale
    selection
      .select 'text'
      .text (u) -> vertexText u.data
      .attr 'y', (u) -> -u.textHeight / 2
    selection
      .select 'rect'
      .attr
        x: (u) -> -u.originalWidth / 2
        y: (u) -> -u.originalHeight / 2
        width: (u) -> u.originalWidth
        height: (u) -> u.originalHeight
        rx: r


updateEdges = () ->
  (selection) ->
    selection
      .enter()
      .append 'g'
      .classed 'edge', true
      .append 'path'
      .attr 'd', ({source, target}) ->
        points = []
        points.push [source.x, source.y]
        for i in [1..edgePointsSize]
          points.push [target.x, target.y]
        edgeLine points
    selection
      .exit()
      .remove()


makeGrid = (graph, pred, oldVertices) ->
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


initContainer = ->
  (selection) ->
    contents = selection.select 'g.contents'
    if contents.empty()
      contents = selection
        .append 'g'
        .classed 'contents', true
      contents
        .append 'rect'
        .classed 'background', true
      contents
        .append 'g'
        .classed 'edges', true
      contents
        .append 'g'
        .classed 'vertices', true
    return


update = (arg) ->
  {vertexScale, vertexText, vertexVisibility} = arg

  (selection) ->
    selection
      .each (graph) ->
        container = d3.select this
        if graph?
          container.call initContainer()
          contents = container.select 'g.contents'

          {vertices, edges} = makeGrid graph
          , ((u) -> vertexVisibility graph.get u)
          , d3.selectAll('g.vertex').data()
          
          contents
            .select 'g.vertices'
            .selectAll 'g.vertex'
            .data vertices, (u) -> u.key
            .call updateVertices
              vertexScale: vertexScale
              vertexText: vertexText
            .on 'click', onClickVertex
              container: container
              graph: graph
          contents
            .select 'g.edges'
            .selectAll 'g.edge'
            .data edges, ({source, target}) -> "#{source.key}:#{target.key}"
            .call updateEdges()
        else
          container
            .select 'g.contents'
            .remove()


layout = () ->
  (selection) ->
    selection
      .each ->
        container = d3.select @
        vertices = container
          .selectAll 'g.vertex'
          .data()
        edges = container
          .selectAll 'g.edge'
          .data()
        vertices.sort (u, v) -> d3.ascending(u.key, v.key)
        edges.sort (e1, e2) -> d3.ascending([e1.source.key, e1.target.key], [e2.source.key, e2.target.key])
        dagre.layout()
          .nodes vertices
          .edges edges
          .lineUpTop true
          .lineUpBottom true
          .rankDir 'LR'
          .rankSep 200
          .edgeSep 20
          .run()
        for u in vertices
          u.x = u.dagre.x
          u.y = u.dagre.y
        for e in edges
          e.points = []
          e.points.push [e.source.x, e.source.y]
          for point in e.dagre.points
            e.points.push [point.x, point.y]
          e.points.push [e.target.x, e.target.y]
          for i in [1..edgePointsSize - e.points.length]
            e.points.push [e.target.x, e.target.y]


transition = (arg) ->
  {vertexOpacity, vertexColor} = arg

  (selection) ->
    trans = selection.transition()
    trans
      .selectAll 'g.vertices > g.vertex'
      .attr 'transform', (u) ->
        egrid.core.svg.transform.compose (egrid.core.svg.transform.translate u.x, u.y), (egrid.core.svg.transform.scale u.scale)
      .style 'opacity', (u) -> vertexOpacity u.data
    trans
      .selectAll 'g.vertices > g.vertex > rect'
      .style 'fill', (u) -> vertexColor u.data
    trans
      .selectAll 'g.edges > g.edge'
      .select 'path'
      .attr 'd', (e) -> edgeLine e.points


draw = (selection) ->
  selection
    .call update
      vertexScale: @vertexScale()
      vertexText: @vertexText()
      vertexVisibility: @vertexVisibility()
    .call resize @size()[0], @size()[1]
    .call layout()
    .call transition
      vertexOpacity: @vertexOpacity()
      vertexColor: @vertexColor()


css = (options = {}) ->
  svgCss = """
  g.vertex > rect, rect.background {
    fill: #{options.backgroundColor || 'whitesmoke'};
  }
  g.edge > path {
    fill: none;
  }
  g.vertex > rect, g.edge > path {
    stroke: #{options.strokeColor || 'black'};
  }
  g.vertex > text {
    fill: #{options.strokeColor || 'black'};
  }
  g.vertex.lower > rect, g.edge.lower > path {
    stroke: #{options.lowerStrokeColor || 'red'};
  }
  g.vertex.upper > rect, g.edge.upper > path {
    stroke: #{options.upperStrokeColor || 'blue'};
  }
  g.vertex.selected > rect {
    stroke: #{options.selectedStrokeColor || 'purple'};
  }
  """
  (selection) ->
    selection
      .selectAll 'defs.egrid-style'
      .remove()
    selection
      .append 'defs'
      .classed 'egrid-style', true
      .append 'style'
      .text svgCss
    return


resize = (width, height) ->
  (selection) ->
    selection
      .attr
        width: width
        height: height
    selection
      .select 'rect.background'
      .attr
        width: width
        height: height
    return


@egrid.core.egm = (options={}) ->
  egm = (selection) ->
    draw.call egm, selection
    return

  accessor = (defaultVal) ->
    val = defaultVal
    (arg) ->
      if arg?
        val = arg
        egm
      else
        val

  optionAttributes =
    enableClickVertex: true
    vertexColor: -> ''
    vertexOpacity: -> 1
    vertexScale: -> 1
    vertexText: (vertexData) -> vertexData.text
    vertexVisibility: -> true
    size: [1, 1]

  egm.css = css

  egm.resize = resize

  egm.options = (options) ->
    for attr of optionAttributes
      egm[attr] options[attr]
    egm

  for attr, val of optionAttributes
    egm[attr] = accessor val

  egm.options options
