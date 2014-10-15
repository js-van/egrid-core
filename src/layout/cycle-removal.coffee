cycleEdges = require './cycle-edges'

module.exports = (graph) ->
  for [u, v] in cycleEdges graph
    graph.removeEdge u, v
    graph.addEdge v, u
