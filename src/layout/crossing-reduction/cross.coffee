module.exports = (graph, vertices1, vertices2) ->
  cross = 0
  n1 = vertices1.length
  n2 = vertices2.length
  for i in [0...n2 - 1]
    u2 = vertices2[i]
    for j in [i + 1...n2]
      v2 = vertices2[j]
      for u1 in vertices1
        if graph.edge u1, u2
          for v1 in vertices1
            if u1 is v1
              break
            if graph.edge v1, v2
              cross += 1
  cross
