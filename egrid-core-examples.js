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
    var color, community, display, du, egm, graph, group, groups, i, key, link, map, mergedGraph, node, overallGraph, u, v, w, workGraph, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    graph = egrid.core.graph.adjacencyList();
    _ref = data.data.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      node.visibility = true;
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
        group: graph.get(vertices[0]).group
      };
    });
    map = {};
    overallGraph = egrid.core.graph.copy(graph);
    _ref4 = mergedGraph.vertices();
    for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
      u = _ref4[_n];
      du = mergedGraph.get(u);
      v = overallGraph.addVertex(du);
      map[u] = v;
      _ref5 = du.vertices;
      for (_o = 0, _len6 = _ref5.length; _o < _len6; _o++) {
        w = _ref5[_o];
        overallGraph.get(w).parent = v;
      }
    }
    _ref6 = mergedGraph.edges();
    for (_p = 0, _len7 = _ref6.length; _p < _len7; _p++) {
      _ref7 = _ref6[_p], u = _ref7[0], v = _ref7[1];
      overallGraph.addEdge(map[u], map[v]);
    }
    workGraph = egrid.core.graph.copy(overallGraph);
    _ref8 = workGraph.vertices();
    for (_q = 0, _len8 = _ref8.length; _q < _len8; _q++) {
      u = _ref8[_q];
      du = workGraph.get(u);
      if (du.vertices == null) {
        workGraph.clearVertex(u);
        workGraph.removeVertex(u);
      }
    }
    color = d3.scale.category20();
    egm = egrid.core.egm().size([800, 800]).contentsMargin(5).dagreRankSep(200).dagreEdgeSep(40).edgeInterpolate('cardinal').edgeTension(0.95).edgeWidth(function(u, v) {
      return 9;
    }).edgeColor(function(u, v) {
      if (workGraph.get(u).community === workGraph.get(v).community) {
        return color(workGraph.get(u).community);
      } else {
        return '#ccc';
      }
    }).selectedStrokeColor('black').upperStrokeColor('black').lowerStrokeColor('black').maxTextLength(10).vertexScale(function() {
      return 3;
    }).vertexColor(function(d) {
      return color(d.community);
    }).layerGroup(function(d) {
      return d.group;
    }).removeRedundantEdges(true).onClickVertex(function(d, u) {
      var dw, parent, _len10, _len11, _len12, _len13, _len14, _len15, _len16, _len9, _r, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref9, _s, _t, _u, _v, _w, _x, _y;
      if (d.vertices != null) {
        workGraph.clearVertex(u);
        workGraph.removeVertex(u);
        _ref9 = d.vertices;
        for (_r = 0, _len9 = _ref9.length; _r < _len9; _r++) {
          v = _ref9[_r];
          workGraph.addVertex(overallGraph.get(v), v);
        }
        _ref10 = d.vertices;
        for (_s = 0, _len10 = _ref10.length; _s < _len10; _s++) {
          v = _ref10[_s];
          _ref11 = overallGraph.adjacentVertices(v);
          for (_t = 0, _len11 = _ref11.length; _t < _len11; _t++) {
            w = _ref11[_t];
            if (workGraph.vertex(w) != null) {
              workGraph.addEdge(v, w);
            } else {
              workGraph.addEdge(v, overallGraph.get(w).parent);
            }
          }
          _ref12 = overallGraph.invAdjacentVertices(v);
          for (_u = 0, _len12 = _ref12.length; _u < _len12; _u++) {
            w = _ref12[_u];
            if (workGraph.vertex(w) != null) {
              workGraph.addEdge(w, v);
            } else {
              workGraph.addEdge(overallGraph.get(w).parent, v);
            }
          }
        }
      } else {
        parent = overallGraph.get(d.parent);
        _ref13 = parent.vertices;
        for (_v = 0, _len13 = _ref13.length; _v < _len13; _v++) {
          v = _ref13[_v];
          workGraph.clearVertex(v);
          workGraph.removeVertex(v);
        }
        workGraph.addVertex(parent, d.parent);
        _ref14 = parent.vertices;
        for (_w = 0, _len14 = _ref14.length; _w < _len14; _w++) {
          v = _ref14[_w];
          _ref15 = overallGraph.adjacentVertices(v);
          for (_x = 0, _len15 = _ref15.length; _x < _len15; _x++) {
            w = _ref15[_x];
            dw = overallGraph.get(w);
            if (dw.parent !== d.parent) {
              if (workGraph.vertex(w)) {
                workGraph.addEdge(d.parent, w);
              } else {
                workGraph.addEdge(d.parent, dw.parent);
              }
            }
          }
          _ref16 = overallGraph.invAdjacentVertices(v);
          for (_y = 0, _len16 = _ref16.length; _y < _len16; _y++) {
            w = _ref16[_y];
            dw = overallGraph.get(w);
            if (dw.parent !== d.parent) {
              if (workGraph.vertex(w)) {
                workGraph.addEdge(w, d.parent);
              } else {
                workGraph.addEdge(dw.parent, d.parent);
              }
            }
          }
        }
      }
      return display.transition().delay(100).duration(300).call(egm);
    });
    return display = d3.select('svg.display').datum(workGraph).call(egm).call(egm.center()).call(d3.downloadable({
      filename: 'egm',
      width: 800,
      height: 800
    }));
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