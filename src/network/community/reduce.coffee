newman = require './newman'
reduce = require '../../graph/reduce'

module.exports = (graph, f=(vertices) -> (graph.get u for u in vertices)) ->
  communities = newman graph
  reduce graph, communities, f
