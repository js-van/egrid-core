(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example', ['ui.router']).factory('d3get', function($q) {
    return function(xhr) {
      var deferred;
      deferred = $q.defer();
      xhr.on('load', function(data) {
        return deferred.resolve(data);
      }).on('error', function(ststus) {
        return deferred.reject(status);
      }).get();
      return deferred.promise;
    };
  }).config(function($urlRouterProvider) {
    return $urlRouterProvider.otherwise('/color');
  });

}).call(this);

},{}],2:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('centrality', {
      controller: 'CentralityController',
      resolve: {
        data: function($http) {
          return $http.get('data/pen.json');
        },
        centrality: function(d3get) {
          return d3get(d3.csv('data/pen.csv').row(function(d) {
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
      templateUrl: 'partials/centrality.html',
      url: '/centrality'
    });
  }).controller('CentralityController', function($scope, data, centrality) {
    var draw, egm, graph, grid;
    graph = egrid.core.graph.graph();
    grid = graph(data.data.nodes, data.data.links);
    egm = egrid.core.egm().enableZoom(false).size([600, 600]);
    d3.select('svg.display').datum(grid).call(egm).call(egm.center());
    draw = function() {
      var colorScale, extent, scale;
      extent = d3.extent(grid.vertices(), function(u) {
        return centrality[u][$scope.centrality];
      });
      colorScale = d3.scale.linear().domain(extent).range([240, 0]);
      scale = d3.scale.linear().domain(extent).range([0, 1]);
      egm.vertexVisibility(function(_, u) {
        return scale(centrality[u][$scope.centrality]) >= $scope.threshold;
      }).vertexColor(function(_, u) {
        return d3.hsl(colorScale(centrality[u][$scope.centrality]), 1, 0.5).toString();
      });
      return d3.select('svg.display').call(egm).call(egm.center());
    };
    $scope.centralities = [
      {
        value: 'weight',
        name: 'Weight'
      }, {
        value: 'degree',
        name: 'Degree Centrality'
      }, {
        value: 'closeness',
        name: 'Closeness Centrality'
      }, {
        value: 'betweenness',
        name: 'Betweenness Centrality'
      }, {
        value: 'eigenvector',
        name: 'Eigenvector Centrality'
      }, {
        value: 'katz',
        name: 'Katz Centrality'
      }
    ];
    $scope.centrality = 'degree';
    $scope.$watch('centrality', function(oldValue, newValue) {
      if (oldValue !== newValue) {
        return draw();
      }
    });
    $scope.threshold = 0;
    $scope.$watch('threshold', function(oldValue, newValue) {
      if (oldValue !== newValue) {
        return draw();
      }
    });
    $scope.nVisibleNode = function() {
      return d3.selectAll('svg.display g.vertex').size();
    };
    return draw();
  });

}).call(this);

},{}],3:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('color', {
      controller: 'ColorController',
      templateUrl: 'partials/color.html',
      url: '/color'
    });
  }).controller('ColorController', function($scope) {
    var edgeText, egm, graph, grid, links, nodes;
    nodes = [
      {
        text: 'aaa',
        size: 1,
        visible: true,
        color: '#ff0000',
        opacity: 0.5
      }, {
        text: 'いいい',
        size: 2,
        visible: true,
        color: '#00ff00',
        opacity: 0.8
      }, {
        text: 'ccc',
        size: 3,
        visible: true,
        color: '#0000ff',
        opacity: 0.2
      }, {
        text: 'ddd',
        size: 4,
        visible: true,
        color: '#00ffff',
        opacity: 0.4
      }, {
        text: 'eee',
        size: 5,
        visible: true,
        color: '#ff00ff',
        opacity: 0.6
      }, {
        text: 'fff',
        size: 6,
        visible: false,
        color: '#ffff00',
        opacity: 0.7
      }
    ];
    links = [
      {
        source: 0,
        target: 1
      }, {
        source: 1,
        target: 2
      }, {
        source: 3,
        target: 1
      }, {
        source: 1,
        target: 4
      }, {
        source: 1,
        target: 5
      }
    ];
    edgeText = {
      '0,1': 'A',
      '1,2': 'B',
      '3,1': 'C',
      '1,4': 'D',
      '1,5': 'E'
    };
    graph = egrid.core.graph.graph();
    grid = graph(nodes, links);
    egm = egrid.core.egm().edgeColor(function(u, v) {
      return grid.get(u).color;
    }).edgeOpacity(function(u, v) {
      return (grid.get(u).opacity + grid.get(v).opacity) / 2;
    }).edgeText(function(u, v) {
      return edgeText[u + ',' + v] || '';
    }).edgeWidth(function(u, v) {
      return (grid.get(u).size + grid.get(v).size) / 2;
    }).enableClickVertex(true).vertexColor(function(vertex) {
      return vertex.color;
    }).vertexOpacity(function(vertex) {
      return vertex.opacity;
    }).vertexScale(function(vertex) {
      return vertex.size;
    }).vertexVisibility(function(vertex) {
      return vertex.visible;
    }).size([$('div.display-container').width(), 300]);
    d3.select('svg.display').datum(grid).call(egm);
    $scope.vertices = grid.vertices().map(function(u) {
      return grid.get(u);
    });
    $scope.update = function() {
      return d3.select('svg.display').call(egm);
    };
    return $scope.updateColor = function() {
      return d3.select('svg.display').call(egm.updateColor());
    };
  });

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('community', {
      controller: 'CommunityController',
      resolve: {
        data: function($http) {
          return $http.get('data/pen.json');
        }
      },
      templateUrl: 'partials/community.html',
      url: '/community'
    });
  }).controller('CommunityController', function($scope, data) {
    var color, community, display1, display2, egm1, egm2, graph, group, groupColor, groups, i, key, link, mergedGraph, node, u, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3;
    $scope.paint = 'layer';
    graph = egrid.core.graph.adjacencyList();
    _ref = data.data.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      node.visibility = false;
      graph.addVertex(node);
    }
    _ref1 = data.data.links;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      link = _ref1[_j];
      graph.addEdge(link.source, link.target);
    }
    groups = [];
    _ref2 = egrid.core.network.community.newman(graph);
    for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
      community = _ref2[i];
      for (_l = 0, _len3 = community.length; _l < _len3; _l++) {
        u = community[_l];
        graph.get(u).community = i;
      }
      _ref3 = ['lower', 'middle', 'upper'];
      for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
        key = _ref3[_m];
        group = community.filter(function(u) {
          return graph.get(u).group === key;
        });
        if (group.length > 0) {
          groups.push(group);
        }
      }
    }
    mergedGraph = egrid.core.graph.reduce(graph, groups, function(vertices, c) {
      return {
        text: vertices.map(function(u) {
          return graph.get(u).text;
        }).join('\n'),
        vertices: vertices,
        community: graph.get(vertices[0]).community,
        group: graph.get(vertices[0]).group,
        selected: false
      };
    });
    groupColor = {
      upper: '#6ff',
      middle: '#cf6',
      lower: '#fc6'
    };
    color = d3.scale.category20();
    egm1 = egrid.core.egm().contentsMargin(5).size([800, 800]).layerGroup(function(d) {
      return d.group;
    }).vertexColor(function(d) {
      if ($scope.paint === 'layer') {
        return groupColor[d.group];
      } else {
        return color(d.community);
      }
    }).vertexVisibility(function(d) {
      return d.visibility;
    });
    display1 = d3.select('svg.display1').datum(graph).call(egm1).call(egm1.center()).call(d3.downloadable({
      filename: 'original',
      width: 800,
      height: 800
    }));
    egm2 = egrid.core.egm().contentsMargin(5).onClickVertex(function(d) {
      var du, _len5, _n, _ref4;
      d.selected = !d.selected;
      _ref4 = graph.vertices();
      for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
        u = _ref4[_n];
        du = graph.get(u);
        if (du.community === d.community) {
          du.visibility = !du.visibility;
        }
      }
      display1.transition().call(egm1).call(egm1.center());
      display2.transition().call(egm2.updateColor());
    }).size([800, 800]).vertexColor(function(d) {
      if ($scope.paint === 'layer') {
        return groupColor[d.group];
      } else {
        return color(d.community);
      }
    }).vertexOpacity(function(d) {
      if (d.selected) {
        return '1';
      } else {
        return '0.8';
      }
    });
    display2 = d3.select('svg.display2').datum(mergedGraph).call(egm2).call(egm2.center()).call(d3.downloadable({
      filename: 'merged',
      width: 800,
      height: 800
    }));
    return $scope.$watch('paint', function(newValue, oldValue) {
      if (newValue !== oldValue) {
        display1.transition().call(egm1.updateColor());
        return display2.transition().call(egm2.updateColor());
      }
    });
  });

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('css', {
      controller: 'CssController',
      templateUrl: 'partials/css.html',
      url: '/css'
    });
  }).controller('CssController', function($scope) {
    var egm, graph, grid;
    graph = egrid.core.graph.graph();
    grid = graph(['hoge', 'fuga', 'piyo'], [
      {
        source: 0,
        target: 1
      }, {
        source: 1,
        target: 2
      }
    ]);
    egm = egrid.core.egm().vertexText(Object).size([$('div.display-container').width(), 400]).backgroundColor('#ffffff').strokeColor('#000000').upperStrokeColor('#ff0000').lowerStrokeColor('#0000ff').selectedStrokeColor('#ff00ff');
    $scope.css = {
      backgroundColor: egm.backgroundColor(),
      strokeColor: egm.strokeColor(),
      upperStrokeColor: egm.upperStrokeColor(),
      lowerStrokeColor: egm.lowerStrokeColor(),
      selectedStrokeColor: egm.selectedStrokeColor()
    };
    d3.select('svg.display').datum(grid).call(egm);
    return $scope.update = function() {
      egm.backgroundColor($scope.css.backgroundColor).strokeColor($scope.css.strokeColor).upperStrokeColor($scope.css.upperStrokeColor).lowerStrokeColor($scope.css.lowerStrokeColor).selectedStrokeColor($scope.css.selectedStrokeColor);
      return d3.select('svg.display').call(egm.css());
    };
  });

}).call(this);

},{}],6:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('simple', {
      controller: 'SimpleController',
      templateUrl: 'partials/simple.html',
      url: '/simple'
    });
  }).controller('SimpleController', function($scope) {
    var draw;
    draw = function() {
      var egm, graph, grid;
      graph = egrid.core.graph.graph();
      grid = graph([
        {
          text: 'hoge'
        }, {
          text: 'fuga'
        }, {
          text: 'piyo'
        }
      ], [
        {
          source: 0,
          target: 1
        }, {
          source: 1,
          target: 2
        }
      ]);
      egm = egrid.core.egm().size([600, 200]);
      return d3.select('svg.display').datum(grid).call(egm);
    };
    $scope.code = draw.toString();
    return draw();
  });

}).call(this);

},{}],7:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('text-cutoff', {
      controller: 'TextCutoffController',
      resolve: {
        data: function($http) {
          return $http.get('data/pen.json');
        }
      },
      templateUrl: 'partials/text-cutoff.html',
      url: '/text-cutoff'
    });
  }).controller('TextCutoffController', function($scope, data) {
    var egm, graph, grid, selection;
    $scope.maxTextLength = 10;
    graph = egrid.core.graph.graph();
    grid = graph(data.data.nodes, data.data.links);
    egm = egrid.core.egm().enableZoom(false).size([600, 600]);
    selection = d3.select('svg.display').datum(grid);
    return $scope.$watch('maxTextLength', function() {
      egm.maxTextLength($scope.maxTextLength);
      return selection.call(egm).call(egm.center());
    });
  });

}).call(this);

},{}],8:[function(require,module,exports){
(function() {
  angular.module('egrid-core-example').config(function($stateProvider) {
    return $stateProvider.state('ui', {
      controller: 'UiController',
      templateUrl: 'partials/ui.html',
      url: '/ui'
    });
  }).controller('UiController', function($scope) {
    var egm, grid, render, selection;
    grid = (function() {
      var data;
      data = localStorage.getItem('ui.grid');
      if (data) {
        grid = JSON.parse(data);
        return egrid.core.grid(grid.vertices, grid.edges);
      } else {
        return egrid.core.grid();
      }
    })();
    egm = egrid.core.egm().contentsMargin(10).contentsScaleMax(2).maxTextLength(10).onClickVertex(function() {
      return $scope.$apply();
    }).size([$('div.display-container').width(), 600]).vertexButtons([
      egrid.core.ui.ladderUpButton(grid, function() {
        render();
        return $scope.$apply();
      }), egrid.core.ui.removeButton(grid, function() {
        render();
        return $scope.$apply();
      }), egrid.core.ui.editButton(grid, function() {
        render();
        return $scope.$apply();
      }), egrid.core.ui.ladderDownButton(grid, function() {
        render();
        return $scope.$apply();
      })
    ]);
    selection = d3.select('svg.display').datum(grid.graph());
    selection.transition().call(egm).call(egm.center());
    render = function() {
      var data;
      selection.transition().call(egm);
      data = grid.graph().dump();
      return localStorage.setItem('ui.grid', JSON.stringify(data));
    };
    $scope.mergeDisabled = function() {
      return selection.selectAll('g.vertex.selected').size() !== 2;
    };
    $scope.undoDisabled = function() {
      return !grid.canUndo();
    };
    $scope.redoDisabled = function() {
      return !grid.canRedo();
    };
    $scope.undo = function() {
      grid.undo();
      return render();
    };
    $scope.redo = function() {
      grid.redo();
      return render();
    };
    $scope.addConstruct = function() {
      var text;
      text = prompt();
      if (text) {
        grid.addConstruct(text);
        return render();
      }
    };
    $scope.mergeConstructs = function() {
      var vertices;
      vertices = selection.selectAll('g.vertex').filter(function(vertex) {
        return vertex.selected;
      }).data().map(function(vertex) {
        return vertex.key;
      });
      if (vertices.length === 2) {
        grid.merge(vertices[0], vertices[1]);
        return render();
      }
    };
    $scope.clear = function() {
      var graph;
      if (confirm('Clear ?')) {
        graph = grid.graph();
        graph.vertices().forEach(function(u) {
          graph.clearVertex(u);
          return graph.removeVertex(u);
        });
        return render();
      }
    };
    $scope.center = function() {
      return selection.transition().call(egm.center());
    };
    return d3.select(window).on('resize', function() {
      return selection.call(egm.resize($('div.display-container').width(), 600));
    });
  });

}).call(this);

},{}],9:[function(require,module,exports){
(function() {
  require('./app');

  require('./controllers/simple');

  require('./controllers/color');

  require('./controllers/css');

  require('./controllers/centrality');

  require('./controllers/community');

  require('./controllers/text-cutoff');

  require('./controllers/ui');

}).call(this);

},{"./app":1,"./controllers/centrality":2,"./controllers/color":3,"./controllers/community":4,"./controllers/css":5,"./controllers/simple":6,"./controllers/text-cutoff":7,"./controllers/ui":8}]},{},[9]);