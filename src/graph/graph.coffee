adjacencyList = require './adjacency-list'

module.exports = ->
  source = (e) -> e.source
  target = (e) -> e.target

  factory = (vertices, edges) ->
    adjacencyList vertices, edges

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
