resize = (width, height) ->
  (selection) ->
    selection
      .attr
        width: width + 'px'
        height: height + 'px'
      .style
        width: width + 'px'
        height: height + 'px'
    selection
      .select 'rect.background'
      .attr
        width: width
        height: height
    return

module.exports = (width, height) ->
  this.size [width, height]
  resize width, height
