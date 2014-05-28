@egrid = @egrid || {}
@egrid.core = @egrid.core || {}
@egrid.core.graph = graph = @egrid.core.graph || {}

graph.graph = ->
  source = (e) -> e.source
  target = (e) -> e.target

  factory = (vertices, edges) ->
    graph.adjacencyList vertices, edges

  factory.source = (f) ->
    if f?
      source = f
      factory
    else
      source

  factory.target = (f) ->
    if f?
      target = f
      factory
    else
      target

  factory
