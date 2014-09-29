angular.module 'egrid-core-example'
  .config ($stateProvider) ->
    $stateProvider
      .state 'text-cutoff',
        controller: 'TextCutoffController'
        resolve:
          data: ($http) ->
            $http.get 'data/pen.json'
        templateUrl: 'partials/text-cutoff.html'
        url: '/text-cutoff'
  .controller 'TextCutoffController', ($scope, data) ->
    $scope.maxTextLength = 10
    graph = egrid.core.graph.graph()
    grid = graph data.data.nodes, data.data.links
    egm = egrid.core.egm()
      .enableZoom false
      .size [600, 600]
    selection = d3.select 'svg.display'
      .datum grid

    $scope.$watch 'maxTextLength', ->
      egm.maxTextLength $scope.maxTextLength
      selection
        .call egm
        .call egm.center()
