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

module.exports =
  translate: (tx, ty) ->
    new Translate tx, ty
  scale: (sx, sy) ->
    new Scale sx, sy
  compose: (transforms...) ->
    transforms
      .map (t) -> t.toString()
      .join ''
