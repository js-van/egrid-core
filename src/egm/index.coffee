svg = require '../svg'
update = require './update'
select = require './select'
adjacencyList = require '../graph/adjacency-list'
cycleRemoval = require '../layout/cycle-removal'
layerAssignment = require '../layout/layer-assignment'


edgeLine = d3.svg.line().interpolate('linear')
edgePointsSize = 20


layout = (arg) ->
  {dagreEdgeSep,
   dagreNodeSep,
   dagreRanker,
   dagreRankSep,
   dagreRankDir,
   layerGroup} = arg
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

        g = new graphlib.Graph multigraph: true, compound: true
          .setGraph({
            edgesep: dagreEdgeSep
            nodesep: dagreNodeSep
            ranker: dagreRanker
            rankdir: dagreRankDir
            ranksep: dagreRankSep
          })
          .setDefaultEdgeLabel -> {}

        for vertex in vertices
          g.setNode vertex.key.toString(),
            width: vertex.width
            height: vertex.height
        for edge in edges
          g.setEdge edge.source.key.toString(), edge.target.key.toString()

        dagre.layout g

        g.nodes().forEach (u) ->
          node = g.node u
          vertex = graph.get u
          vertex.x = node.x
          vertex.y = node.y
          return
        g.edges().forEach (e) ->
          edge = graph.get e.v, e.w
          {source, target} = edge
          edge.points = g.edge(e.v, e.w).points.map ({x, y}) -> [x, y]
          n = edge.points.length
          if dagreRankDir is 'LR'
            edge.points[0] = [source.x + source.width / 2, source.y]
            edge.points[n - 1] = [target.x - target.width / 2, target.y]
          else
            edge.points[0] = [source.x, source.y + source.height / 2]
            edge.points[n - 1] = [target.x, target.y - target.height / 2]
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
          edgeVisibility: egm.edgeVisibility()
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
          dagreRanker: egm.dagreRanker()
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
    dagreRanker: (g) ->
      visited = {}
      dfs = (v) ->
        label = g.node v
        if visited[v]?
          return label.rank
        visited[v] = true
        rank = d3.max g.inEdges(v), (e) -> dfs(e.v) + g.edge(e).minlen
        if rank is undefined
          rank = 0
        label.rank = rank
      g.sinks().forEach dfs
      maxRank = d3.max g.nodes(), (u) -> g.node(u).rank
      for u in g.nodes()
        if g.outEdges(u).length is 0
          g.node(u).rank = maxRank
    dagreRankDir: 'LR'
    dagreRankSep: 30
    edgeColor: -> ''
    edgeInterpolate: 'linear'
    edgeOpacity: -> 1
    edgeTension: 0.7
    edgeText: -> ''
    edgeVisibility: -> true
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
