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


transition = (egm, arg) ->
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
      .call egm.updateColor()


module.exports = () ->
  zoom = d3.behavior.zoom()
    .scaleExtent [0, 1]

  egm = (selection) ->
    margin = egm.contentsMargin()
    scaleMax = egm.contentsScaleMax()

    selection.each (graph) ->
      container = d3.select this
      container
        .call egm.css
          backgroundColor: egm.backgroundColor()
          strokeColor: egm.strokeColor()
          lowerStrokeColor: egm.lowerStrokeColor()
          upperStrokeColor: egm.upperStrokeColor()
          selectedStrokeColor: egm.selectedStrokeColor()
        .call update graph,
          clickVertexCallback: egm.onClickVertex()
          edgeLine: edgeLine
          edgePointsSize: edgePointsSize
          edgeText: egm.edgeText()
          enableZoom: egm.enableZoom()
          maxTextLength: egm.maxTextLength()
          textSeparator: egm.textSeparator()
          vertexButtons: egm.vertexButtons()
          vertexScale: egm.vertexScale()
          vertexText: egm.vertexText()
          vertexVisibility: egm.vertexVisibility()
          zoom: zoom
        .call egm.resize egm.size()[0], egm.size()[1]
        .call layout
          dagreEdgeSep: egm.dagreEdgeSep()
          dagreNodeSep: egm.dagreNodeSep()
          dagreRankDir: egm.dagreRankDir()
          dagreRankSep: egm.dagreRankSep()
      selection
        .call transition egm,
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
      scale = d3.min [(width - 2 * margin) / (right - left),
                      (height - 2 * margin) / (bottom - top),
                      1]
      zoom.scaleExtent [scale, scaleMax]
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
    backgroundColor: 'whitesmoke'
    contentsMargin: 0
    contentsScaleMax: 1
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
    lowerStrokeColor: 'red'
    maxTextLength: Infinity
    onClickVertex: ->
    selectedStrokeColor: 'purple'
    strokeColor: 'black'
    textSeparator: (s) -> s.split '\n'
    vertexButtons: -> []
    vertexColor: -> ''
    vertexFontWeight: -> 'normal'
    vertexOpacity: -> 1
    vertexScale: -> 1
    vertexStrokeWidth: -> 1
    vertexText: (vertexData) -> vertexData.text
    vertexVisibility: -> true
    size: [1, 1]
    upperStrokeColor: 'blue'

  for attr, val of optionAttributes
    egm[attr] = accessor val

  egm.center = require('./center')(zoom)
  egm.css = require './css'
  egm.resize = require './resize'
  egm.updateColor = require('./update-color')

  egm
