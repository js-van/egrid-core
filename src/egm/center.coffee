svg = require '../svg'

module.exports = (zoom) ->
  (arg={}) ->
    egm = this
    scale = arg.scale ? 1
    margin = egm.contentsMargin()
    maxScale = egm.contentsScaleMax()

    (selection) ->
      selection.each ->
        container = d3.select this
        [width, height] = egm.size()
        vertices = container
          .selectAll 'g.vertex'
          .data()
        left = (d3.min vertices, (vertex) -> vertex.x - vertex.width / 2) ? 0
        right = (d3.max vertices, (vertex) -> vertex.x + vertex.width / 2) ? 0
        top = (d3.min vertices, (vertex) -> vertex.y - vertex.height / 2) ? 0
        bottom = (d3.max vertices, (vertex) -> vertex.y + vertex.height / 2) ? 0
        contentScale = scale * d3.min [
          (width - 2 * margin) / (right - left),
          (height - 2 * margin) / (bottom - top),
          maxScale
        ]
        x = ((width - 2 * margin) - (right - left) * contentScale) / 2 + margin
        y = ((height - 2 * margin) - (bottom - top) * contentScale) / 2 + margin
        zoom
          .scale contentScale
          .translate [x, y]
        t = svg.transform.translate x, y
        s = svg.transform.scale contentScale
        selection
          .select 'g.contents'
          .attr 'transform', svg.transform.compose(t, s)
        return
      return
