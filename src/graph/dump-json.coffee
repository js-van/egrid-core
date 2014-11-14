module.exports = (graph) ->
  nodes: graph.vertices().map (u) -> graph.get u
  links: graph.edges().map (edge) ->
    source: edge[0]
    target: edge[1]
