@egrid = @egrid || {}
@egrid.core = @egrid.core || {}
@egrid.core.svg = @egrid.core.svg || {}
@egrid.core.svg.transform = transform = @egrid.core.svg.transform || {}

class Translate
  constructor: (tx, ty=0) ->
    @tx = tx
    @ty = ty

  toString: ->
    "translate(#{@tx},#{@ty})"

class Scale
  constructor: (sx, sy) ->
    @sx = sx
    @sy = sy || sx

  toString: ->
    "scale(#{@sx},#{@sy})"

transform.translate = (tx, ty) ->
  new Translate tx, ty

transform.scale = (sx, sy) ->
  new Scale sx, sy

transform.compose = (transforms...) ->
  transforms
    .map (t) -> t.toString()
    .join ''
