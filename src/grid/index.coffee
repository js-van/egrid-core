Graph = require 'eg-graph/lib/graph'


module.exports = (vertices, edges) ->
  graph = new Graph()
  undoStack = []
  redoStack = []
  execute = (transaction) ->
    transaction.execute()
    undoStack.push transaction
    redoStack = []
    return

  class EgmGraph
    constructor: ->

    graph: ->
      graph

    addConstruct: (text) ->
      v = null
      value =
        text: text
        original: true
      for u in graph.vertices()
        if graph.vertex(u).text is value.text
          return +u
      execute
        execute: ->
          if v?
            graph.addVertex v, value
          else
            v = graph.addVertex value
        revert: ->
          graph.removeVertex v
      v

    removeConstruct: (u) ->
      value = graph.vertex u
      edges = [].concat(
        ([v, u] for v in graph.inVertices u),
        ([u, v] for v in graph.outVertices u))
      execute
        execute: ->
          graph.removeVertex u
        revert: ->
          graph.addVertex u, value
          for [v, w] in edges
            graph.addEdge v, w
      return

    updateConstruct: (u, key, value) ->
      properties = graph.vertex u
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

    ladderUp: (u, text) ->
      v = null
      value =
        text: text
        original: false
      dup = (+w for w in graph.vertices() when graph.vertex(w).text is value.text)
      if dup.length > 0
        v = dup[0]
        execute
          execute: ->
            graph.addEdge v, u
          revert: ->
            graph.removeEdge v, u
      else
        execute
          execute: ->
            v = graph.addVertex value, v
            graph.addEdge v, u
          revert: ->
            graph.removeEdge v, u
            graph.removeVertex v
      v

    ladderDown: (u, text) ->
      v = null
      value =
        text: text
        original: false
      dup = (+w for w in graph.vertices() when graph.vertex(w).text is value.text)
      if dup.length > 0
        v = dup[0]
        execute
          execute: ->
            graph.addEdge u, v
          revert: ->
            graph.removeEdge u, v
      else
        execute
          execute: ->
            v = graph.addVertex value, v
            graph.addEdge u, v
          revert: ->
            graph.removeEdge u, v
            graph.removeVertex v
      v

    merge: (u, v, f) ->
      f = f || (u, v) ->
        text: "#{graph.vertex(u).text}, #{graph.vertex(v).text}"
      uValue = graph.vertex u
      vValue = graph.vertex v
      wValue = f u, v
      uAdjacentVertices = graph.adjacentVertices u
      uInvAdjacentVertices = graph.invAdjacentVertices u
      vAdjacentVertices = graph.adjacentVertices v
      vInvAdjacentVertices = graph.invAdjacentVertices v
      execute
        execute: ->
          graph.set u, wValue
          graph.clearVertex v
          graph.removeVertex v
          for w in vAdjacentVertices
            if w is v
              graph.addEdge u, u
            else if w isnt u
              graph.addEdge u, w
          for w in vInvAdjacentVertices
            if w is v
              graph.addEdge u, u
            else if w isnt u and w isnt v
              graph.addEdge w, u
        revert: ->
          graph.clearVertex u
          graph.addVertex vValue, v
          for w in uAdjacentVertices
            graph.addEdge u, w
          for w in uInvAdjacentVertices
            graph.addEdge w, u
          for w in vAdjacentVertices
            graph.addEdge v, w
          for w in vInvAdjacentVertices
            graph.addEdge w, v
            graph.set u, uValue
      u

    group: (vs, attrs={}) ->
      u = null
      execute
        execute: ->
          node =
            children: []
            links: []
          for key, value of attrs
            node[key] = value
          if u is null
            u = graph.addVertex node
          else
            graph.addVertex node, u
          for v in vs
            node.children.push
              key: v
              node: graph.vertex v
            for w in graph.adjacentVertices v
              wData = graph.vertex w
              if wData.children
                for link in wData.links
                  if link[0] is v
                    node.links.push [v, link[1]]
              else
                node.links.push [v, w]
            for w in graph.invAdjacentVertices v
              wData = graph.vertex w
              if wData.children
                for link in wData.links
                  if link[1] is v
                    node.links.push [link[0], v]
              else
                node.links.push [w, v]
          for v in vs
            for w in graph.adjacentVertices v
              if vs.indexOf(w) < 0
                graph.addEdge u, w
            for w in graph.invAdjacentVertices v
              if vs.indexOf(w) < 0
                graph.addEdge w, u
          for v in vs
            graph.clearVertex v
            graph.removeVertex v
        revert: ->
          groupMap = {}
          for v in graph.vertices()
            vData = graph.vertex v
            if vData.children
              for {key} in vData.children
                groupMap[key] = v
          uData = graph.vertex u
          for {key, node} in uData.children
            graph.addVertex node, key
          for [v, w] in uData.links
            if graph.vertex(v) is null
              graph.addEdge groupMap[v], w
            else if graph.vertex(w) is null
              graph.addEdge v, groupMap[w]
            else
              graph.addEdge v, w
          graph.clearVertex u
          graph.removeVertex u
      u

    ungroup: (u) ->
      uData = graph.vertex u
      vs = uData.children.map ({key}) -> key
      execute
        execute: ->
          groupMap = {}
          for v in graph.vertices()
            vData = graph.vertex v
            if vData.children
              for {key} in vData.children
                groupMap[key] = v
          for {key, node} in uData.children
            graph.addVertex node, key
          for [v, w] in uData.links
            if graph.vertex(v) is null
              graph.addEdge groupMap[v], w
            else if graph.vertex(w) is null
              graph.addEdge v, groupMap[w]
            else
              graph.addEdge v, w
          graph.clearVertex u
          graph.removeVertex u
        revert: ->
          graph.addVertex uData, u
          for v in vs
            for w in graph.adjacentVertices v
              if vs.indexOf(w) < 0
                graph.addEdge u, w
            for w in graph.invAdjacentVertices v
              if vs.indexOf(w) < 0
                graph.addEdge w, u
          for v in vs
            graph.clearVertex v
            graph.removeVertex v
      return

    canUndo: ->
      undoStack.length > 0

    canRedo: ->
      redoStack.length > 0

    undo: ->
      throw new Error 'Undo stack is empty' unless @canUndo()
      transaction = undoStack.pop()
      transaction.revert()
      redoStack.push transaction
      return

    redo: ->
      throw new Error 'Redo stack is empty' unless @canRedo()
      transaction = redoStack.pop()
      transaction.execute()
      undoStack.push transaction
      return

  new EgmGraph
