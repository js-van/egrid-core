graph = require '../graph'


module.exports = (graph) ->
  undoStack = []
  redoStack = []
  execute = (transaction) ->
    transaction.execute()
    undoStack.push transaction
    redoStack = []
    return

  class EgmGraph
    constructor: ->

    addConstruct: (value) ->
      v = null
      execute
        execute: ->
          v = graph.addVertex value, v
        revert: ->
          graph.removeVertex v
      v

    removeConstruct: (u) ->
      value = graph.get u
      edges = graph.inEdges(u).concat graph.outEdges(u)
      execute
        execute: ->
          graph.clearVertex u
          graph.removeVertex u
        revert: ->
          graph.addVertex value, u
          for [v, w] in edges
            graph.addEdge v, w
      return

    updateConstruct: (u, key, value) ->
      properties = graph.get u
      oldValue = properties[key]
      execute
        execute: ->
          properties[key] = value
        revert: ->
          properties[key] = oldValue
      return

    addEdge: (u, v) ->
      execute
        execute: ->
          graph.addEdge u, v
        revert: ->
          graph.removeEdge u, v
      return

    removeEdge: (u, v) ->
      execute
        execute: ->
          graph.removeEdge u, v
        revert: ->
          graph.addEdge u, v
      return

    ladderUp: (u, value) ->
      v = null
      execute
        execute: ->
          v = graph.addVertex value, v
          graph.addEdge v, u
        revert: ->
          graph.removeEdge v, u
          graph.removeVertex v
      v

    ladderDown: (u, value) ->
      v = null
      execute
        execute: ->
          v = graph.addVertex value, v
          graph.addEdge u, v
        revert: ->
          graph.removeEdge u, v
          graph.removeVertex v
      v

    undo: ->
      transaction = undoStack.pop()
      transaction.revert()
      redoStack.push transaction
      return

    redo: ->
      transaction = redoStack.pop()
      transaction.execute()
      undoStack.push transaction
      return

  new EgmGraph
