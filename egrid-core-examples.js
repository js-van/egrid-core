var app = angular.module('egrid-core-example', ['ui.router'])
  .factory('d3get', ['$q', function($q) {
    return function(xhr) {
      var deferred = $q.defer();
      xhr
        .on('load', function(data) {
          deferred.resolve(data);
        })
        .on('error', function(ststus) {
          deferred.reject(status);
        })
        .get()
        ;
      return deferred.promise;
    };
  }])
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/color');

    $stateProvider
      .state('simple', {
        url: '/simple',
        templateUrl: 'partials/simple.html',
        controller: function($scope) {
          function draw() {
            var graph = egrid.core.graph.graph();
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
          var graph = egrid.core.graph.graph();
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
      .state('centrality', {
        url: '/centrality',
        templateUrl: 'partials/centrality.html',
        resolve: {
          data: function($http) {
            return $http.get('data/pen.json');
          },
          centrality: function(d3get) {
            return d3get(d3.csv('data/pen.csv')
              .row(function(d) {
                return {
                  weight: +d.weight,
                  degree: +d.degree,
                  closeness: +d.closeness,
                  betweenness: +d.betweenness,
                  eigenvector: +d.eigenvector,
                  katz: +d.katz,
                  average: +d.average,
                  naverage: +d.naverage,
                  pca1: +d.pca1,
                  pca2: +d.pca2
                };
              }));
          }
        },
        controller: function($scope, data, centrality) {
          var graph = egrid.core.graph.graph();
          var grid = graph(data.data.nodes, data.data.links);

          var egm = egrid.core.egm()
            .enableZoom(false)
            .size([600, 600]);
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css())
            .call(egm)
            .call(egm.center());

          function draw() {
            var extent = d3.extent(grid.vertices(), function(u) {
              return centrality[u][$scope.centrality];
            });
            var colorScale = d3.scale.linear()
              .domain(extent)
              .range([240, 0]);
            var scale = d3.scale.linear()
              .domain(extent)
              .range([0, 1]);

            egm
              .vertexVisibility(function(_, u) {
                return scale(centrality[u][$scope.centrality]) >= $scope.threshold;
              })
              .vertexColor(function(_, u) {
                return d3.hsl(colorScale(centrality[u][$scope.centrality]), 1, 0.5).toString();
              });

            d3.select('svg.display')
              .call(egm)
              .call(egm.center());
          }

          $scope.centralities = [
            {value: 'weight', name: 'Weight'},
            {value: 'degree', name: 'Degree Centrality'},
            {value: 'closeness', name: 'Closeness Centrality'},
            {value: 'betweenness', name: 'Betweenness Centrality'},
            {value: 'eigenvector', name: 'Eigenvector Centrality'},
            {value: 'katz', name: 'Katz Centrality'}
          ];

          $scope.centrality = 'degree';
          $scope.$watch('centrality', function(oldValue, newValue) {
            if (oldValue != newValue) {
              draw();
            }
          });

          $scope.threshold = 0;
          $scope.$watch('threshold', function(oldValue, newValue) {
            if (oldValue != newValue) {
              draw();
            }
          });

          $scope.nVisibleNode = function() {
            return d3.selectAll('svg.display g.vertex').size();
          };

          draw();
        }
      })
      .state('text-cutoff', {
        url: '/text-cutoff',
        templateUrl: 'partials/text-cutoff.html',
        resolve: {
          data: function($http) {
            return $http.get('data/pen.json');
          }
        },
        controller: function($scope, data) {
          $scope.maxTextLength = 10;
          var graph = egrid.core.graph.graph();
          var grid = graph(data.data.nodes, data.data.links);
          var egm = egrid.core.egm()
            .enableZoom(false)
            .size([600, 600]);
          var selection = d3.select('svg.display')
            .datum(grid)
            .call(egm.css());

          $scope.$watch('maxTextLength', function() {
            egm.maxTextLength($scope.maxTextLength);
            selection
              .call(egm)
              .call(egm.center());
          });
        }
      })
      .state('ui', {
        url: '/ui',
        templateUrl: 'partials/ui.html',
        controller: function($scope) {
          var grid = (function() {
            var vertices = JSON.parse(localStorage.getItem('ui.vertices')) || [];
            var edges = JSON.parse(localStorage.getItem('ui.edges')) || [];
            return egrid.core.grid(vertices, edges);
          })();
          var egm = egrid.core.egm()
            .size([$('div.display-container').width(), 600])
            .maxTextLength(10)
            .vertexButtons([
              egrid.core.ui.ladderUpButton(grid, function() {
                render();
                $scope.$apply();
              }),
              egrid.core.ui.removeButton(grid, function() {
                render();
                $scope.$apply();
              }),
              egrid.core.ui.editButton(grid, function() {
                render();
                $scope.$apply();
              }),
              egrid.core.ui.ladderDownButton(grid, function() {
                render();
                $scope.$apply();
              })
            ]);
          var selection = d3.select('svg.display')
            .datum(grid.graph())
            .call(egm.css())
            .call(egm);

          var render = function() {
            selection.call(egm);
            var graph = grid.graph();
            var vertexMap = {};
            var vertices = graph.vertices().map(function(u, i) {
              vertexMap[u] = i;
              return graph.get(u);
            });
            var edges = graph.edges().map(function(edge) {
              return {
                source: vertexMap[edge[0]],
                target: vertexMap[edge[1]]
              };
            });
            localStorage.setItem('ui.vertices', JSON.stringify(vertices));
            localStorage.setItem('ui.edges', JSON.stringify(edges));
          };

          $scope.undoDisabled = function() {
            return !grid.canUndo();
          };

          $scope.redoDisabled = function() {
            return !grid.canRedo();
          };

          $scope.undo = function() {
            grid.undo();
            render();
          };

          $scope.redo = function() {
            grid.redo();
            render();
          };

          $scope.addConstruct = function() {
            var text = prompt();
            if (text) {
              grid.addConstruct(text);
              render();
            }
          };

          $scope.mergeConstructs = function() {
            var vertices = selection
              .selectAll('g.vertex')
              .filter(function(vertex) {
                return vertex.selected;
              })
              .data()
              .map(function(vertex) {
                return vertex.key;
              });
            if (vertices.length == 2) {
              grid.merge(vertices[0], vertices[1]);
              render();
            }
          };

          $scope.clear = function() {
            var graph = grid.graph();
            graph.vertices().forEach(function(u) {
              graph.clearVertex(u);
              graph.removeVertex(u);
            });
            render();
          };

          d3.select(window)
            .on('resize', function() {
              gridSelection
                .call(egm.resize($('display-container').width(), 600));
            });
        }
      })
      ;
  })
  ;
