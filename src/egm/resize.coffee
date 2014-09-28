resize = (width, height) ->
  (selection) ->
    selection
      .attr
        width: width
        height: height
    selection
      .select 'rect.background'
      .attr
        width: width
        height: height
    return

module.exports = (width, height) ->
  this.size [width, height]
  resize width, height
