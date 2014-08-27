svg = require '../svg'
update = require './update'
select = require './select'


edgeLine = d3.svg.line().interpolate('linear')
edgePointsSize = 20


layout = (arg) ->
  {dagreEdgeSep, dagreNodeSep, dagreRankSep, dagreRankDir} = arg
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
        edges.sort (e1, e2) -> d3.ascending([e1.source.key, e1.target.key],
                                            [e2.source.key, e2.target.key])
        dagre.layout()
          .nodes vertices
          .edges edges
          .lineUpTop true
          .lineUpBottom true
          .rankDir dagreRankDir
          .nodeSep dagreNodeSep
          .rankSep dagreRankSep
          .edgeSep dagreEdgeSep
          .run()
        for u in vertices
          u.x = u.dagre.x
          u.y = u.dagre.y
        for e in edges
          e.points = []
          e.points.push if dagreRankDir is 'LR'
            [e.source.x + e.source.width / 2, e.source.y]
          else
            [e.source.x, e.source.y + e.source.height / 2]
          for point in e.dagre.points
            e.points.push [point.x, point.y]
          e.points.push if dagreRankDir is 'LR'
            [e.target.x - e.target.width / 2, e.target.y]
          else
            [e.target.x, e.target.y - e.target.height / 2]
          for i in [1..edgePointsSize - e.points.length]
            e.points.push e.points[e.points.length - 1]


transition = (arg) ->
  (selection) ->
    selection
      .selectAll 'g.vertices > g.vertex'
      .attr 'transform', (u) ->
        svg.transform.compose((svg.transform.translate u.x, u.y),
                              (svg.transform.scale u.scale))
    selection
      .selectAll 'g.edges>g.edge'
      .select 'path'
      .attr 'd', (e) -> edgeLine e.points
    selection
      .selectAll 'g.edges>g.edge'
      .select 'text'
      .attr 'transform', (e) ->
        svg.transform.translate e.points[1][0], e.points[1][1]
    selection
      .call paint arg


paint = (arg) ->
  {vertexOpacity, vertexColor,
   edgeColor, edgeOpacity, edgeWidth} = arg
  (selection) ->
    selection
      .selectAll 'g.vertices>g.vertex'
      .style 'opacity', (vertex) -> vertexOpacity vertex.data, vertex.key
    selection
      .selectAll 'g.vertices>g.vertex>rect'
      .style 'fill', (vertex) -> vertexColor vertex.data, vertex.key
    selection
      .selectAll 'g.edges>g.edge>path'
      .style
        opacity: ({source, target}) -> edgeOpacity source.key, target.key
        stroke: ({source, target}) -> edgeColor source.key, target.key
        'stroke-width': ({source, target}) -> edgeWidth source.key, target.key


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


module.exports = (options={}) ->
  zoom = d3.behavior.zoom()
    .scaleExtent [0, 1]

  egm = (selection) ->
    selection.each (graph) ->
      container = d3.select this
      container
        .call update graph,
          edgePointsSize: edgePointsSize
          edgeLine: edgeLine
          edgeText: egm.edgeText()
          clickVertexCallback: egm.onClickVertex()
          vertexButtons: egm.vertexButtons()
          vertexScale: egm.vertexScale()
          vertexText: egm.vertexText()
          vertexVisibility: egm.vertexVisibility()
          enableZoom: egm.enableZoom()
          zoom: zoom
          maxTextLength: egm.maxTextLength()
        .call resize egm.size()[0], egm.size()[1]
        .call layout
          dagreEdgeSep: egm.dagreEdgeSep()
          dagreNodeSep: egm.dagreNodeSep()
          dagreRankDir: egm.dagreRankDir()
          dagreRankSep: egm.dagreRankSep()
      selection
        .call transition
          edgeColor: egm.edgeColor()
          edgeOpacity: egm.edgeOpacity()
          edgeWidth: egm.edgeWidth()
          vertexOpacity: egm.vertexOpacity()
          vertexColor: egm.vertexColor()
      container
        .call select egm.vertexButtons()

      [width, height] = egm.size()
      vertices = container
        .selectAll 'g.vertex'
        .data()
      left = d3.min vertices, (vertex) -> vertex.x - vertex.width / 2
      right = d3.max vertices, (vertex) -> vertex.x + vertex.width / 2
      top = d3.min vertices, (vertex) -> vertex.y - vertex.height / 2
      bottom = d3.max vertices, (vertex) -> vertex.y + vertex.height / 2
      scale = d3.min [Math.min width / (right - left),
                      height / (bottom - top), 1]
      zoom.scaleExtent [scale, 1]
      return
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
    dagreEdgeSep: 10
    dagreNodeSep: 20
    dagreRankDir: 'LR'
    dagreRankSep: 30
    edgeColor: -> ''
    edgeOpacity: -> 1
    edgeText: -> ''
    edgeWidth: -> 1
    enableClickVertex: true
    enableZoom: true
    maxTextLength: Infinity
    onClickVertex: ->
    vertexButtons: -> []
    vertexColor: -> ''
    vertexOpacity: -> 1
    vertexScale: -> 1
    vertexText: (vertexData) -> vertexData.text
    vertexVisibility: -> true
    size: [1, 1]

  egm.css = (options = {}) ->
    svgCss = """
    g.vertex > rect, rect.background {
      fill: #{options.backgroundColor ? 'whitesmoke'};
    }
    g.edge > path {
      fill: none;
    }
    g.vertex > rect, g.edge > path {
      stroke: #{options.strokeColor ? 'black'};
    }
    g.vertex > text {
      fill: #{options.strokeColor ? 'black'};
      font-family: 'Lucida Grande', 'Hiragino Kaku Gothic ProN',
        'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif;
      font-size: 14px;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
    g.vertex.lower > rect, g.edge.lower > path {
      stroke: #{options.lowerStrokeColor ? 'red'};
    }
    g.vertex.upper > rect, g.edge.upper > path {
      stroke: #{options.upperStrokeColor ? 'blue'};
    }
    g.vertex.upper.lower>rect, g.edge.upper.lower>path {
      stroke: #{options.selectedStrokeColor ? 'purple'};
    }
    rect.background {
      cursor: move;
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
    g.vertex {
      cursor: pointer;
    }
    g.vertex-buttons {
      opacity: 0.7;
    }
    g.vertex-button {
      cursor: pointer;
    }
    g.vertex-button>rect {
      fill: #fff;
      stroke: #adadad
    }
    g.vertex-button.hover>rect {
      fill: #ebebeb;
    }
    """
    (selection) ->
      selection.each ->
        container = d3.select this
        container
          .selectAll 'defs.egrid-style'
          .remove()
        container
          .append 'defs'
          .classed 'egrid-style', true
          .append 'style'
          .text svgCss

  egm.resize = (width, height) ->
    egm.size([width, height])
    resize width, height

  egm.center = (arg={}) ->
    scale = arg.scale ? 1
    maxScale = arg.maxScale ? 1

    (selection) ->
      selection.each ->
        container = d3.select this
        [width, height] = egm.size()
        vertices = container
          .selectAll 'g.vertex'
          .data()
        left = (d3.min vertices, (vertex) -> vertex.x - vertex.width / 2) ? 0
        right = (d3.max vertices, (vertex) -> vertex.x + vertex.width / 2) ? 0
        top = (d3.min vertices, (vertex) -> vertex.y - vertex.height / 2) ? 0
        bottom = (d3.max vertices, (vertex) -> vertex.y + vertex.height / 2) ? 0
        contentScale = scale * d3.min [
          width / (right - left),
          height / (bottom - top),
          maxScale
        ]
        x = (width - (right - left) * contentScale) / 2
        y = (height - (bottom - top) * contentScale) / 2
        zoom
          .scale contentScale
          .translate [x, y]
        t = svg.transform.translate x, y
        s = svg.transform.scale contentScale
        selection
          .select 'g.contents'
          .attr 'transform', svg.transform.compose(t, s)
        return
      return

  egm.updateColor = () ->
    (selection) ->
      selection
        .call paint
          edgeColor: egm.edgeColor()
          edgeOpacity: egm.edgeOpacity()
          edgeWidth: egm.edgeWidth()
          vertexColor: egm.vertexColor()
          vertexOpacity: egm.vertexOpacity()

  egm.options = (options) ->
    for attr of optionAttributes
      egm[attr] options[attr]
    egm

  for attr, val of optionAttributes
    egm[attr] = accessor val

  egm.options options
