paint = (arg) ->
  {vertexOpacity, vertexColor,
   edgeColor, edgeOpacity, edgeWidth} = arg
  (selection) ->
    selection
      .selectAll 'g.vertices>g.vertex'
      .style 'opacity', (vertex) -> vertexOpacity vertex.data, vertex.key
    selection
      .selectAll 'g.vertices>g.vertex>rect'
      .style 'fill', (vertex) -> vertexColor vertex.data, vertex.key
    selection
      .selectAll 'g.edges>g.edge>path'
      .style
        opacity: ({source, target}) -> edgeOpacity source.key, target.key
        stroke: ({source, target}) -> edgeColor source.key, target.key
        'stroke-width': ({source, target}) -> edgeWidth source.key, target.key

module.exports = ->
  egm = this
  (selection) ->
    selection
      .call paint
        edgeColor: egm.edgeColor()
        edgeOpacity: egm.edgeOpacity()
        edgeWidth: egm.edgeWidth()
        vertexColor: egm.vertexColor()
        vertexOpacity: egm.vertexOpacity()
