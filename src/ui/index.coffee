module.exports =
  removeButton: (grid, callback) ->
    icon: 'images/glyphicons_207_remove_2.png'
    onClick: (d, u) ->
      grid.removeConstruct u
      callback()
  editButton: (grid, callback) ->
    icon: 'images/glyphicons_030_pencil.png'
    onClick: (d, u) ->
      text = prompt()
      if text?
        grid.updateConstruct u, 'text', text
        callback()
  ladderUpButton: (grid, callback) ->
    icon: 'images/glyphicons_210_left_arrow.png'
    onClick: (d, u) ->
      text = prompt()
      if text?
        grid.ladderUp u,
          text: text
        callback()
  ladderDownButton: (grid, callback) ->
    icon: 'images/glyphicons_211_right_arrow.png'
    onClick: (d, u) ->
      text = prompt()
      if text?
        grid.ladderDown u,
          text: text
        callback()
