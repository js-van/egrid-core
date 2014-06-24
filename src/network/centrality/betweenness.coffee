module.exports = ->
  (graph) ->
    result = {}
    for v in graph.vertices()
      result[v] = 0
    for s in graph.vertices()
      stack = []
      paths = {}
      sigma = {}
      d = {}
      delta = {}
      for t in graph.vertices()
        paths[t] = []
        sigma[t] = 0
        d[t] = -1
        delta[t] = 0
      sigma[s] = 1
      d[s] = 0
      queue = [s]
      while queue.length > 0
        v = queue.shift()
        stack.push v
        for w in graph.adjacentVertices v
          if d[w] < 0
            queue.push w
            d[w] = d[v] + 1
          if d[w] == d[v] + 1
            sigma[w] += sigma[v]
            paths[w].push v
      while stack.length > 0
        w = stack.pop()
        for v in paths[w]
          delta[v] += sigma[v] / sigma[w] * (1 + delta[w])
          if w isnt s
            result[w] += delta[w]
    result
