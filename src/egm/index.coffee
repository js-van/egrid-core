svg = require '../svg'
update = require './update'
select = require './select'
adjacencyList = require '../graph/adjacency-list'
cycleRemoval = require '../layout/cycle-removal'
layerAssignment = require '../layout/layer-assignment'


edgeLine = d3.svg.line().interpolate('linear')
edgePointsSize = 20


layout = (arg) ->
  {dagreEdgeSep, dagreNodeSep, dagreRankSep, dagreRankDir, layerGroup} = arg
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

        graph = adjacencyList()
        vertexLayerGroup = {}
        layerGroups = d3.set()
        for vertex in vertices
          graph.addVertex vertex, vertex.key
          vertexLayerGroup[vertex.key] = layerGroup vertex.data, vertex.key
          layerGroups.add vertexLayerGroup[vertex.key]
        for edge in edges
          graph.addEdge edge.source.key, edge.target.key, edge

        g = new dagre.Digraph()
        for vertex in vertices
          node =
            width: vertex.width
            height: vertex.height
          u = vertex.key
          adjacentVertices = graph.adjacentVertices u
          invAdjacentVertices = graph.invAdjacentVertices u
          pred = (v) -> vertexLayerGroup[u] isnt vertexLayerGroup[v]
          if adjacentVertices.length is 0
            node.rank = "same_#{vertexLayerGroup[u]}_sink"
          else if invAdjacentVertices.length is 0
            node.rank = "same_#{vertexLayerGroup[u]}_source"
          else if adjacentVertices.every pred
            node.rank = "same_#{vertexLayerGroup[u]}_sink"
          else if invAdjacentVertices.every pred
            node.rank = "same_#{vertexLayerGroup[u]}_source"
          g.addNode vertex.key.toString(), node
        for edge in edges
          g.addEdge null, edge.source.key.toString(), edge.target.key.toString()

        result = dagre.layout()
          .edgeSep dagreEdgeSep
          .nodeSep dagreNodeSep
          .rankDir dagreRankDir
          .rankSep dagreRankSep
          .run g

        result.eachNode (u, node) ->
          vertex = graph.get u
          vertex.x = node.x
          vertex.y = node.y
          return
        result.eachEdge (_, u, v, e) ->
          edge = graph.get u, v
          {source, target} = edge
          edge.points = e.points.map ({x, y}) -> [x, y]
          n = edge.points.length
          if dagreRankDir is 'LR'
            edge.points.unshift [source.x + source.width / 2, source.y]
            edge.points.push [target.x - target.width / 2, target.y]
          else
            edge.points.unshift [source.x, source.y + source.height / 2]
            edge.points.push [target.x, target.y - target.height / 2]
          return

        return


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
    edgeLine
      .interpolate egm.edgeInterpolate()
      .tension egm.edgeTension()

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
          vertexFontWeight: egm.vertexFontWeight()
          vertexScale: egm.vertexScale()
          vertexStrokeWidth: egm.vertexStrokeWidth()
          vertexText: egm.vertexText()
          vertexVisibility: egm.vertexVisibility()
          zoom: zoom
        .call egm.resize egm.size()[0], egm.size()[1]
        .call layout
          dagreEdgeSep: egm.dagreEdgeSep()
          dagreNodeSep: egm.dagreNodeSep()
          dagreRankDir: egm.dagreRankDir()
          dagreRankSep: egm.dagreRankSep()
          layerGroup: egm.layerGroup()
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
    edgeInterpolate: 'linear'
    edgeOpacity: -> 1
    edgeTension: 0.7
    edgeText: -> ''
    edgeWidth: -> 1
    enableClickVertex: true
    enableZoom: true
    layerGroup: -> ''
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
