var app = angular.module('egrid-core-example', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/color');

    $stateProvider
      .state('simple', {
        url: '/simple',
        templateUrl: 'partials/simple.html',
        controller: function($scope) {
          function draw() {
            var graph = egrid.core.graph.graph()
            var grid = graph(
              [{text: 'hoge'}, {text: 'fuga'}, {text: 'piyo'}],
              [{source: 0, target: 1}, {source: 1, target: 2}]
            );
            var egm = egrid.core.egm()
              .size([600, 200]);
            d3.select('svg.display')
              .datum(grid)
              .call(egm.css())
              .call(egm);
          }

          $scope.code = draw.toString();

          draw();
        }
      })
      .state('color', {
        url: '/color',
        templateUrl: 'partials/color.html',
        controller: function($scope) {
          var graph = egrid.core.graph.graph();
          var grid = graph(
            [
              {text: 'aaa', size: 1, visible: true, color: '#ff0000', opacity: 0.5},
              {text: 'いいい', size: 2, visible: true, color: '#00ff00', opacity: 0.8},
              {text: 'ccc', size: 3, visible: true, color: '#0000ff', opacity: 0.2},
              {text: 'ddd', size: 4, visible: true, color: '#00ffff', opacity: 0.4},
              {text: 'eee', size: 5, visible: true, color: '#ff00ff', opacity: 0.6},
              {text: 'fff', size: 6, visible: false, color: '#ffff00', opacity: 0.7}
            ],
            [
              {source: 0, target: 1},
              {source: 1, target: 2},
              {source: 3, target: 1},
              {source: 1, target: 4},
              {source: 1, target: 5}
            ]
          );
          var egm = egrid.core.egm({
            enableClickNode: true,
            vertexColor: function(vertex) {
              return vertex.color;
            },
            vertexOpacity: function(vertex) {
              return vertex.opacity;
            },
            vertexScale: function(vertex) {
              return vertex.size;
            },
            vertexVisibility: function(vertex) {
              return vertex.visible;
            },
            size: [$('div.display-container').width(), 300],
          });
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css())
            .call(egm);

          $scope.vertices = grid.vertices().map(function(u) {
            return grid.get(u);
          });
          $scope.update = function() {
            d3.select('svg.display').call(egm);
          };
        }
      })
      .state('css', {
        url: '/css',
        templateUrl: 'partials/css.html',
        controller: function($scope) {
          var graph = egrid.core.graph.graph()
          var grid = graph(
            ['hoge', 'fuga', 'piyo'],
            [{source: 0, target: 1}, {source: 1, target: 2}]
          );
          var egm = egrid.core.egm()
            .vertexText(Object)
            .size([$('div.display-container').width(), 400]);
          $scope.css = {
            backgroundColor: '#ffffff',
            strokeColor: '#000000',
            upperStrokeColor: '#ff0000',
            lowerStrokeColor: '#0000ff',
            selectedStrokeColor: '#ff00ff'
          };
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css($scope.css))
            .call(egm);

          $scope.update = function() {
            d3.select('svg.display').call(egm.css($scope.css));
          };
        }
      })
      ;
  })
  ;
