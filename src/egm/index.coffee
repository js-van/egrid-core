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
  {vertexOpacity, vertexColor} = arg

  (selection) ->
    trans = selection.transition()
    trans
      .selectAll 'g.vertices > g.vertex'
      .attr 'transform', (u) ->
        svg.transform.compose((svg.transform.translate u.x, u.y),
                              (svg.transform.scale u.scale))
      .style 'opacity', (u) -> vertexOpacity u.data
    trans
      .selectAll 'g.vertices > g.vertex > rect'
      .style 'fill', (u) -> vertexColor u.data, u.key
    trans
      .selectAll 'g.edges > g.edge'
      .select 'path'
      .attr 'd', (e) -> edgeLine e.points


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
    selection
      .call update
        edgePointsSize: edgePointsSize
        edgeLine: edgeLine
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
      .call transition
        vertexOpacity: egm.vertexOpacity()
        vertexColor: egm.vertexColor()
      .call select egm.vertexButtons()
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
    enableClickVertex: true
    enableZoom: true
    maxTextLength: Infinity
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
      user-select: none;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
    }
    g.vertex.lower > rect, g.edge.lower > path {
      stroke: #{options.lowerStrokeColor || 'red'};
    }
    g.vertex.upper > rect, g.edge.upper > path {
      stroke: #{options.upperStrokeColor || 'blue'};
    }
    g.vertex.upper.lower>rect, g.edge.upper.lower>path {
      stroke: #{options.selectedStrokeColor || 'purple'};
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
      selection
        .selectAll 'defs.egrid-style'
        .remove()
      selection
        .append 'defs'
        .classed 'egrid-style', true
        .append 'style'
        .text svgCss

  egm.resize = (width, height) ->
    egm.size([width, height])
    resize width, height

  egm.center = () ->
    (selection) ->
      [width, height] = egm.size()
      vertices = selection
        .selectAll 'g.vertex'
        .data()
      left = d3.min vertices, (vertex) -> vertex.x - vertex.width / 2
      right = d3.max vertices, (vertex) -> vertex.x + vertex.width / 2
      top = d3.min vertices, (vertex) -> vertex.y - vertex.height / 2
      bottom = d3.max vertices, (vertex) -> vertex.y + vertex.height / 2
      scale = Math.min width / (right - left), height / (bottom - top)
      zoom
        .scale scale
        .translate [(width - (right - left) * scale) / 2,
                    (height - (bottom - top) * scale) / 2]
        .event selection.select 'g.contents'

  egm.options = (options) ->
    for attr of optionAttributes
      egm[attr] options[attr]
    egm

  for attr, val of optionAttributes
    egm[attr] = accessor val

  egm.options options
