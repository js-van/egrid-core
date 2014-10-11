module.exports =  ->
  scope =
    widthAccessor: (d, u) -> d.width
    heightAccessor: (d, u) -> d.height

  layout = (graph) ->
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

  layout.layerAssignment = require './layer-assignment'

  layout
