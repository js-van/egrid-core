module.exports =  ->
  egm = this
  svgCss = """
  g.vertex > rect, rect.background {
    fill: #{egm.backgroundColor()};
  }
  g.edge > path {
    fill: none;
  }
  g.vertex > rect, g.edge > path {
    stroke: #{egm.strokeColor()};
  }
  g.vertex > text {
    fill: #{egm.strokeColor()};
    font-family: 'Lucida Grande', 'Hiragino Kaku Gothic ProN',
      'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif;
    font-size: 14px;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
  g.vertex.lower > rect, g.edge.lower > path {
    stroke: #{egm.lowerStrokeColor()};
  }
  g.vertex.upper > rect, g.edge.upper > path {
    stroke: #{egm.upperStrokeColor()};
  }
  g.vertex.upper.lower>rect, g.edge.upper.lower>path {
    stroke: #{egm.selectedStrokeColor()};
  }
  rect.background {
    cursor: move;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }
  g.vertex {
    cursor: pointer;
  }
  g.vertex-buttons {
    opacity: 0.7;
  }
  g.vertex-button {
    cursor: pointer;
  }
  g.vertex-button>rect {
    fill: #fff;
    stroke: #adadad
  }
  g.vertex-button.hover>rect {
    fill: #ebebeb;
  }
  """
  (selection) ->
    selection.each ->
      container = d3.select this
      container
        .selectAll 'defs.egrid-style'
        .remove()
      container
        .append 'defs'
        .classed 'egrid-style', true
        .append 'style'
        .text svgCss
