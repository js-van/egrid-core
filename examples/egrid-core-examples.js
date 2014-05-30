function scatterMatrix(data) {
  var width = 960,
      size = 150,
      padding = 19.5;
  var x = d3.scale.linear()
      .range([padding / 2, size - padding / 2]);
  var y = d3.scale.linear()
      .range([size - padding / 2, padding / 2]);
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5);
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(5);
  var color = d3.scale.category10();

  return function(selection) {
    var domainByTrait = {},
        traits = d3.keys(data[0]).filter(function(d) { return d !== "species"; }),
        n = traits.length;

    traits.forEach(function(trait) {
      domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
    });

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var brush = d3.svg.brush()
        .x(x)
        .y(y)
        .on("brushstart", brushstart)
        .on("brush", brushmove)
        .on("brushend", brushend);

    var svg = selection
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
      .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");
  
    svg.selectAll(".x.axis")
        .data(traits)
      .enter().append("g")
        .attr("class", "x axis")
        .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
        .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });
  
    svg.selectAll(".y.axis")
        .data(traits)
      .enter().append("g")
        .attr("class", "y axis")
        .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
        .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });
  
    var cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
      .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);
  
    // Titles for the diagonal.
    cell.filter(function(d) { return d.i === d.j; }).append("text")
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(function(d) { return d.x; });
  
    cell.call(brush);
  
    function plot(p) {
      var cell = d3.select(this);
  
      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);
  
      cell.append("rect")
          .attr("class", "frame")
          .attr("x", padding / 2)
          .attr("y", padding / 2)
          .attr("width", size - padding)
          .attr("height", size - padding);
  
      cell.selectAll("circle")
          .data(data)
        .enter().append("circle")
          .attr("cx", function(d) { return x(d[p.x]); })
          .attr("cy", function(d) { return y(d[p.y]); })
          .attr("r", 3)
          .style("fill", function(d) { return color(d.species); });
    }
  
    var brushCell;
  
    // Clear the previously-active brush, if any.
    function brushstart(p) {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.clear());
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
        brushCell = this;
      }
    }
  
    // Highlight the selected circles.
    function brushmove(p) {
      var e = brush.extent();
      svg.selectAll("circle").classed("inactive", function(d) {
        return e[0][0] > d[p.x] || d[p.x] > e[1][0]
            || e[0][1] > d[p.y] || d[p.y] > e[1][1];
      });
    }
  
    // If the brush is empty, select all circles.
    function brushend() {
      if (brush.empty()) svg.selectAll(".inactive").classed("inactive", false);
    }
  
    function cross(a, b) {
      var c = [], n = a.length, m = b.length, i, j;
      for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
      return c;
    }
  
    d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");
  }
}


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
      .state('centrality', {
        url: '/centrality',
        templateUrl: 'partials/centrality.html',
        resolve: {
          data: function($http) {
            return $http.get('data/pen.json');
          }
        },
        controller: function($scope, data) {
          var graph = egrid.core.graph.graph();
          var grid = graph(data.data.nodes, data.data.links);
          var weight = grid.vertices().map(function(u) {return grid.get(u).weight});
          var degreeCentrality = egrid.core.network.centrality.degree(grid);
          var closenessCentrality = egrid.core.network.centrality.closeness(function() {return 1})(grid);
          var betweennessCentrality = egrid.core.network.centrality.betweenness()(grid);

          var weights = grid.vertices().map(function(u) {
            return {
              weight: weight[u],
              degreeCentrality: degreeCentrality[u],
              closenessCentrality: closenessCentrality[u],
              betweennessCentrality: betweennessCentrality[u]
            };
          });

          d3.select('svg.scatter-plot')
            .call(scatterMatrix(weights));

          var egm = egrid.core.egm()
            .size([600, 600]);
          d3.select('svg.display')
            .datum(grid)
            .call(egm.css())
            .call(egm);

          $scope.centrality = 'degree';
          $scope.$watch('centrality', function(oldValue, newValue) {
            var centrality;
            if ($scope.centrality == 'weight') {
              centrality = weight;
            } else if ($scope.centrality == 'degree') {
              centrality = degreeCentrality;
            } else if ($scope.centrality == 'closeness') {
              centrality = closenessCentrality;
            } else {
              centrality = betweennessCentrality;
            }

            var extent = d3.extent(grid.vertices(), function(u) {
              return centrality[u];
            });
            var scale = d3.scale.linear()
              .domain(extent)
              .range([240, 0]);

            egm.vertexColor(function(_, u) {
              return d3.hsl(scale(centrality[u]), 1, 0.5).toString();
            });
            d3.select('svg.display')
              .call(egm);
          });
        }
      })
      ;
  })
  ;
