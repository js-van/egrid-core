angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'ui',
        controller: 'UiController'
        templateUrl: 'partials/ui.html'
        url: '/ui'
  .controller 'UiController', ($scope) ->
    grid = (->
      data = localStorage.getItem 'ui.grid'
      if data
        grid = JSON.parse data
        egrid.core.grid grid.vertices, grid.edges
      else
        egrid.core.grid()
    )()
    egm = egrid.core.egm()
      .contentsMargin 10
      .contentsScaleMax 2
      .maxTextLength 10
      .onClickVertex ->
        $scope.$apply()
      .size [$('div.display-container').width(), 600]
      .vertexButtons [
        egrid.core.ui.ladderUpButton grid, ->
          render()
          $scope.$apply()
        egrid.core.ui.removeButton grid, ->
          render()
          $scope.$apply()
        egrid.core.ui.editButton grid, ->
          render()
          $scope.$apply()
        egrid.core.ui.ladderDownButton grid, ->
          render()
          $scope.$apply()
      ]
    selection = d3.select 'svg.display'
      .datum grid.graph()
    selection
      .transition()
      .call egm
      .call egm.center()

    render = ->
      selection
        .transition()
        .call egm
      data = grid.graph().dump()
      localStorage.setItem 'ui.grid', JSON.stringify data

    $scope.mergeDisabled = ->
      selection.selectAll('g.vertex.selected').size() != 2

    $scope.undoDisabled = ->
      !grid.canUndo()

    $scope.redoDisabled = ->
      !grid.canRedo()

    $scope.undo = ->
      grid.undo()
      render()

    $scope.redo = ->
      grid.redo()
      render()

    $scope.addConstruct = ->
      text = prompt()
      if text
        grid.addConstruct text
        render()

    $scope.mergeConstructs = ->
      vertices = selection
        .selectAll 'g.vertex'
        .filter (vertex) ->
          vertex.selected
        .data()
        .map (vertex) ->
          vertex.key
      if vertices.length == 2
        grid.merge vertices[0], vertices[1]
        render()

    $scope.clear = ->
      if confirm 'Clear ?'
        graph = grid.graph()
        graph.vertices().forEach (u) ->
          graph.clearVertex u
          graph.removeVertex u
        render()

    $scope.center = ->
      selection
        .transition()
        .call egm.center()

    d3.select window
      .on 'resize', ->
        selection
          .call egm.resize($('div.display-container').width(), 600)
