layerAssignment = require './layer-assignment'
normalize = require './normalize'
crossingReduction = require './crossing-reduction'

module.exports = ->
  scope =
    widthAccessor: (d, u) -> d.width
    heightAccessor: (d, u) -> d.height

  layout = (graph) ->
    vertexLayer = layerAssignment graph
    height = (d3.max graph.vertices(), (u) -> vertexLayer[u]) + 1
    layers = [0...height].map (l) ->
      graph.vertices().filter (u) -> vertexLayer[u] is l
    width = d3.max layers, (layer) -> layer.length
    g = normalize graph, vertexLayer
    for i in [1...height]
      layers[i] = crossingReduction.barycenter g, layers[i - 1], layers[i]
    pos =
      vertices: {}
      edges: {}
    for u in graph.vertices()
      pos.vertices[u] =
        x: 0
        y: 0
    pos

  layout.width = (arg) ->
    if arg?
      scope.widthAccessor = arg
      layout
    else
      scope.widthAccessor

  layout.height = (arg) ->
    if arg?
      scope.heightAccessor = arg
      layout
    else
      scope.heightAccessor

  layout
