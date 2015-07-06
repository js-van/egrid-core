(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  var egrid;

  egrid = {
    core: require('../../')
  };

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
      return d3.select('svg.display').call(egm.updateColor());
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

},{"../../":11}],3:[function(require,module,exports){
(function() {
  var egrid;

  egrid = {
    core: require('../../')
  };

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

},{"../../":11}],4:[function(require,module,exports){
(function() {
  var egrid;

  egrid = {
    core: require('../../')
  };

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
    var color, community, display, du, dv, egm, graph, group, groups, i, invisibleEdges, key, link, lower, map, mergedGraph, middle, node, overallGraph, removeEdge, u, v, w, workGraph, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _s, _t;
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
    invisibleEdges = {};
    removeEdge = function(u, v) {
      if (invisibleEdges[u] == null) {
        invisibleEdges[u] = {};
      }
      return invisibleEdges[u][v] = true;
    };
    _ref8 = overallGraph.vertices();
    for (_q = 0, _len8 = _ref8.length; _q < _len8; _q++) {
      u = _ref8[_q];
      du = overallGraph.get(u);
      if (du.vertices != null) {
        if (du.group === 'upper') {
          middle = lower = null;
          _ref9 = overallGraph.adjacentVertices(u);
          for (_r = 0, _len9 = _ref9.length; _r < _len9; _r++) {
            v = _ref9[_r];
            dv = overallGraph.get(v);
            if (dv.community === du.community) {
              if (dv.group === 'middle') {
                middle = v;
              } else if (dv.group === 'lower') {
                lower = v;
              }
            }
          }
          if ((middle != null) && overallGraph.edge(u, lower)) {
            removeEdge(u, lower);
          }
        }
      }
    }
    _ref10 = egrid.core.graph.redundantEdges(graph);
    for (_s = 0, _len10 = _ref10.length; _s < _len10; _s++) {
      _ref11 = _ref10[_s], u = _ref11[0], v = _ref11[1];
      removeEdge(u, v);
    }
    workGraph = egrid.core.graph.copy(overallGraph);
    _ref12 = workGraph.vertices();
    for (_t = 0, _len11 = _ref12.length; _t < _len11; _t++) {
      u = _ref12[_t];
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
    }).edgeVisibility(function(u, v) {
      return (invisibleEdges[u] == null) || !invisibleEdges[u][v];
    }).selectedStrokeColor('black').upperStrokeColor('black').lowerStrokeColor('black').maxTextLength(10).vertexScale(function() {
      return 3;
    }).vertexColor(function(d) {
      return color(d.community);
    }).layerGroup(function(d) {
      return d.group;
    }).onClickVertex(function(d, u) {
      var dw, parent, _aa, _ab, _len12, _len13, _len14, _len15, _len16, _len17, _len18, _len19, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20, _u, _v, _w, _x, _y, _z;
      if (d.vertices != null) {
        workGraph.clearVertex(u);
        workGraph.removeVertex(u);
        _ref13 = d.vertices;
        for (_u = 0, _len12 = _ref13.length; _u < _len12; _u++) {
          v = _ref13[_u];
          workGraph.addVertex(overallGraph.get(v), v);
        }
        _ref14 = d.vertices;
        for (_v = 0, _len13 = _ref14.length; _v < _len13; _v++) {
          v = _ref14[_v];
          _ref15 = overallGraph.adjacentVertices(v);
          for (_w = 0, _len14 = _ref15.length; _w < _len14; _w++) {
            w = _ref15[_w];
            if (workGraph.vertex(w) != null) {
              workGraph.addEdge(v, w);
            } else {
              workGraph.addEdge(v, overallGraph.get(w).parent);
            }
          }
          _ref16 = overallGraph.invAdjacentVertices(v);
          for (_x = 0, _len15 = _ref16.length; _x < _len15; _x++) {
            w = _ref16[_x];
            if (workGraph.vertex(w) != null) {
              workGraph.addEdge(w, v);
            } else {
              workGraph.addEdge(overallGraph.get(w).parent, v);
            }
          }
        }
      } else {
        parent = overallGraph.get(d.parent);
        _ref17 = parent.vertices;
        for (_y = 0, _len16 = _ref17.length; _y < _len16; _y++) {
          v = _ref17[_y];
          workGraph.clearVertex(v);
          workGraph.removeVertex(v);
        }
        workGraph.addVertex(parent, d.parent);
        _ref18 = parent.vertices;
        for (_z = 0, _len17 = _ref18.length; _z < _len17; _z++) {
          v = _ref18[_z];
          _ref19 = overallGraph.adjacentVertices(v);
          for (_aa = 0, _len18 = _ref19.length; _aa < _len18; _aa++) {
            w = _ref19[_aa];
            dw = overallGraph.get(w);
            if (dw.parent !== d.parent) {
              if (workGraph.vertex(w)) {
                workGraph.addEdge(d.parent, w);
              } else {
                workGraph.addEdge(d.parent, dw.parent);
              }
            }
          }
          _ref20 = overallGraph.invAdjacentVertices(v);
          for (_ab = 0, _len19 = _ref20.length; _ab < _len19; _ab++) {
            w = _ref20[_ab];
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

},{"../../":11}],5:[function(require,module,exports){
(function() {
  var egrid;

  egrid = {
    core: require('../../')
  };

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

},{"../../":11}],6:[function(require,module,exports){
(function() {
  var egrid;

  egrid = {
    core: require('../../')
  };

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

},{"../../":11}],7:[function(require,module,exports){
(function() {
  var egrid;

  egrid = {
    core: require('../../')
  };

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

},{"../../":11}],8:[function(require,module,exports){
(function() {
  var egrid;

  egrid = {
    core: require('../../')
  };

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

},{"../../":11}],9:[function(require,module,exports){
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

},{"./app":1,"./controllers/centrality":2,"./controllers/color":3,"./controllers/community":4,"./controllers/css":5,"./controllers/simple":6,"./controllers/text-cutoff":7,"./controllers/ui":8}],10:[function(require,module,exports){
(function() {
  var Graph;

  Graph = require('eg-graph/lib/graph');

  module.exports = function(vertices, edges) {
    var EgmGraph, execute, graph, redoStack, undoStack;
    graph = new Graph();
    undoStack = [];
    redoStack = [];
    execute = function(transaction) {
      transaction.execute();
      undoStack.push(transaction);
      redoStack = [];
    };
    EgmGraph = (function() {
      function EgmGraph() {}

      EgmGraph.prototype.graph = function() {
        return graph;
      };

      EgmGraph.prototype.addConstruct = function(text) {
        var u, v, value, _i, _len, _ref;
        v = null;
        value = {
          text: text,
          original: true
        };
        _ref = graph.vertices();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          u = _ref[_i];
          if (graph.vertex(u).text === value.text) {
            return +u;
          }
        }
        execute({
          execute: function() {
            if (v != null) {
              return graph.addVertex(v, value);
            } else {
              return v = graph.addVertex(value);
            }
          },
          revert: function() {
            return graph.removeVertex(v);
          }
        });
        return v;
      };

      EgmGraph.prototype.removeConstruct = function(u) {
        var v, value;
        value = graph.vertex(u);
        edges = [].concat((function() {
          var _i, _len, _ref, _results;
          _ref = graph.inVertices(u);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _results.push([v, u]);
          }
          return _results;
        })(), (function() {
          var _i, _len, _ref, _results;
          _ref = graph.outVertices(u);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            v = _ref[_i];
            _results.push([u, v]);
          }
          return _results;
        })());
        execute({
          execute: function() {
            return graph.removeVertex(u);
          },
          revert: function() {
            var w, _i, _len, _ref, _results;
            graph.addVertex(u, value);
            _results = [];
            for (_i = 0, _len = edges.length; _i < _len; _i++) {
              _ref = edges[_i], v = _ref[0], w = _ref[1];
              _results.push(graph.addEdge(v, w));
            }
            return _results;
          }
        });
      };

      EgmGraph.prototype.updateConstruct = function(u, key, value) {
        var oldValue, properties;
        properties = graph.vertex(u);
        oldValue = properties[key];
        execute({
          execute: function() {
            return properties[key] = value;
          },
          revert: function() {
            return properties[key] = oldValue;
          }
        });
      };

      EgmGraph.prototype.addEdge = function(u, v) {
        execute({
          execute: function() {
            return graph.addEdge(u, v);
          },
          revert: function() {
            return graph.removeEdge(u, v);
          }
        });
      };

      EgmGraph.prototype.removeEdge = function(u, v) {
        execute({
          execute: function() {
            return graph.removeEdge(u, v);
          },
          revert: function() {
            return graph.addEdge(u, v);
          }
        });
      };

      EgmGraph.prototype.ladderUp = function(u, text) {
        var dup, v, value, w;
        v = null;
        value = {
          text: text,
          original: false
        };
        dup = (function() {
          var _i, _len, _ref, _results;
          _ref = graph.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            w = _ref[_i];
            if (graph.vertex(w).text === value.text) {
              _results.push(+w);
            }
          }
          return _results;
        })();
        if (dup.length > 0) {
          v = dup[0];
          execute({
            execute: function() {
              return graph.addEdge(v, u);
            },
            revert: function() {
              return graph.removeEdge(v, u);
            }
          });
        } else {
          execute({
            execute: function() {
              if (v != null) {
                graph.addVertex(v, value);
              } else {
                v = graph.addVertex(value);
              }
              return graph.addEdge(v, u);
            },
            revert: function() {
              graph.removeEdge(v, u);
              return graph.removeVertex(v);
            }
          });
        }
        return v;
      };

      EgmGraph.prototype.ladderDown = function(u, text) {
        var dup, v, value, w;
        v = null;
        value = {
          text: text,
          original: false
        };
        dup = (function() {
          var _i, _len, _ref, _results;
          _ref = graph.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            w = _ref[_i];
            if (graph.vertex(w).text === value.text) {
              _results.push(+w);
            }
          }
          return _results;
        })();
        if (dup.length > 0) {
          v = dup[0];
          execute({
            execute: function() {
              return graph.addEdge(u, v);
            },
            revert: function() {
              return graph.removeEdge(u, v);
            }
          });
        } else {
          execute({
            execute: function() {
              if (v != null) {
                graph.addVertex(v, value);
              } else {
                v = graph.addVertex(value);
              }
              return graph.addEdge(u, v);
            },
            revert: function() {
              graph.removeEdge(u, v);
              return graph.removeVertex(v);
            }
          });
        }
        return v;
      };

      EgmGraph.prototype.merge = function(u, v, f) {
        var uAdjacentVertices, uInvAdjacentVertices, uValue, vAdjacentVertices, vInvAdjacentVertices, vValue, wValue;
        f = f || function(u, v) {
          return {
            text: "" + (graph.vertex(u).text) + ", " + (graph.vertex(v).text)
          };
        };
        uValue = graph.vertex(u);
        vValue = graph.vertex(v);
        wValue = f(u, v);
        uAdjacentVertices = graph.outVertices(u);
        uInvAdjacentVertices = graph.inVertices(u);
        vAdjacentVertices = graph.outVertices(v);
        vInvAdjacentVertices = graph.inVertices(v);
        execute({
          execute: function() {
            var w, _i, _j, _len, _len1, _results;
            graph.addVertex(u, wValue);
            graph.removeVertex(v);
            for (_i = 0, _len = vAdjacentVertices.length; _i < _len; _i++) {
              w = vAdjacentVertices[_i];
              if (w === v) {
                graph.addEdge(u, u);
              } else if (w !== u) {
                graph.addEdge(u, w);
              }
            }
            _results = [];
            for (_j = 0, _len1 = vInvAdjacentVertices.length; _j < _len1; _j++) {
              w = vInvAdjacentVertices[_j];
              if (w === v) {
                _results.push(graph.addEdge(u, u));
              } else if (w !== u && w !== v) {
                _results.push(graph.addEdge(w, u));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          },
          revert: function() {
            var w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _results;
            graph.removeVertex(u);
            graph.addVertex(u, uValue);
            graph.addVertex(v, vValue);
            for (_i = 0, _len = uAdjacentVertices.length; _i < _len; _i++) {
              w = uAdjacentVertices[_i];
              graph.addEdge(u, w);
            }
            for (_j = 0, _len1 = uInvAdjacentVertices.length; _j < _len1; _j++) {
              w = uInvAdjacentVertices[_j];
              graph.addEdge(w, u);
            }
            for (_k = 0, _len2 = vAdjacentVertices.length; _k < _len2; _k++) {
              w = vAdjacentVertices[_k];
              graph.addEdge(v, w);
            }
            _results = [];
            for (_l = 0, _len3 = vInvAdjacentVertices.length; _l < _len3; _l++) {
              w = vInvAdjacentVertices[_l];
              _results.push(graph.addEdge(w, v));
            }
            return _results;
          }
        });
        return u;
      };

      EgmGraph.prototype.group = function(vs, attrs) {
        var u;
        if (attrs == null) {
          attrs = {};
        }
        u = null;
        execute({
          execute: function() {
            var key, link, node, v, value, w, wData, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
            node = {
              children: [],
              links: []
            };
            for (key in attrs) {
              value = attrs[key];
              node[key] = value;
            }
            if (u === null) {
              u = graph.addVertex(node);
            } else {
              graph.addVertex(u, node);
            }
            for (_i = 0, _len = vs.length; _i < _len; _i++) {
              v = vs[_i];
              node.children.push({
                key: v,
                node: graph.vertex(v)
              });
              _ref = graph.outVertices(v);
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                w = _ref[_j];
                wData = graph.vertex(w);
                if (wData.children) {
                  _ref1 = wData.links;
                  for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                    link = _ref1[_k];
                    if (link[0] === v) {
                      node.links.push([v, link[1]]);
                    }
                  }
                } else {
                  node.links.push([v, w]);
                }
              }
              _ref2 = graph.inVertices(v);
              for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
                w = _ref2[_l];
                wData = graph.vertex(w);
                if (wData.children) {
                  _ref3 = wData.links;
                  for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
                    link = _ref3[_m];
                    if (link[1] === v) {
                      node.links.push([link[0], v]);
                    }
                  }
                } else {
                  node.links.push([w, v]);
                }
              }
            }
            for (_n = 0, _len5 = vs.length; _n < _len5; _n++) {
              v = vs[_n];
              _ref4 = graph.outVertices(v);
              for (_o = 0, _len6 = _ref4.length; _o < _len6; _o++) {
                w = _ref4[_o];
                if (vs.indexOf(w) < 0) {
                  graph.addEdge(u, w);
                }
              }
              _ref5 = graph.inVertices(v);
              for (_p = 0, _len7 = _ref5.length; _p < _len7; _p++) {
                w = _ref5[_p];
                if (vs.indexOf(w) < 0) {
                  graph.addEdge(w, u);
                }
              }
            }
            _results = [];
            for (_q = 0, _len8 = vs.length; _q < _len8; _q++) {
              v = vs[_q];
              _results.push(graph.removeVertex(v));
            }
            return _results;
          },
          revert: function() {
            var groupMap, key, node, uData, v, vData, w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
            groupMap = {};
            _ref = graph.vertices();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              v = _ref[_i];
              vData = graph.vertex(v);
              if (vData.children) {
                _ref1 = vData.children;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  key = _ref1[_j].key;
                  groupMap[key] = v;
                }
              }
            }
            uData = graph.vertex(u);
            _ref2 = uData.children;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              _ref3 = _ref2[_k], key = _ref3.key, node = _ref3.node;
              graph.addVertex(key, node);
            }
            _ref4 = uData.links;
            for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
              _ref5 = _ref4[_l], v = _ref5[0], w = _ref5[1];
              if (graph.vertex(v) === null) {
                graph.addEdge(groupMap[v], w);
              } else if (graph.vertex(w) === null) {
                graph.addEdge(v, groupMap[w]);
              } else {
                graph.addEdge(v, w);
              }
            }
            return graph.removeVertex(u);
          }
        });
        return u;
      };

      EgmGraph.prototype.ungroup = function(u) {
        var uData, vs;
        uData = graph.vertex(u);
        vs = uData.children.map(function(_arg) {
          var key;
          key = _arg.key;
          return key;
        });
        execute({
          execute: function() {
            var groupMap, key, node, v, vData, w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
            groupMap = {};
            _ref = graph.vertices();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              v = _ref[_i];
              vData = graph.vertex(v);
              if (vData.children) {
                _ref1 = vData.children;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                  key = _ref1[_j].key;
                  groupMap[key] = v;
                }
              }
            }
            _ref2 = uData.children;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              _ref3 = _ref2[_k], key = _ref3.key, node = _ref3.node;
              graph.addVertex(key, node);
            }
            _ref4 = uData.links;
            for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
              _ref5 = _ref4[_l], v = _ref5[0], w = _ref5[1];
              if (graph.vertex(v) === null) {
                graph.addEdge(groupMap[v], w);
              } else if (graph.vertex(w) === null) {
                graph.addEdge(v, groupMap[w]);
              } else {
                graph.addEdge(v, w);
              }
            }
            return graph.removeVertex(u);
          },
          revert: function() {
            var v, w, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _results;
            graph.addVertex(u, uData);
            for (_i = 0, _len = vs.length; _i < _len; _i++) {
              v = vs[_i];
              _ref = graph.outVertices(v);
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                w = _ref[_j];
                if (vs.indexOf(w) < 0) {
                  graph.addEdge(u, w);
                }
              }
              _ref1 = graph.inVertices(v);
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                w = _ref1[_k];
                if (vs.indexOf(w) < 0) {
                  graph.addEdge(w, u);
                }
              }
            }
            _results = [];
            for (_l = 0, _len3 = vs.length; _l < _len3; _l++) {
              v = vs[_l];
              _results.push(graph.removeVertex(v));
            }
            return _results;
          }
        });
      };

      EgmGraph.prototype.canUndo = function() {
        return undoStack.length > 0;
      };

      EgmGraph.prototype.canRedo = function() {
        return redoStack.length > 0;
      };

      EgmGraph.prototype.undo = function() {
        var transaction;
        if (!this.canUndo()) {
          throw new Error('Undo stack is empty');
        }
        transaction = undoStack.pop();
        transaction.revert();
        redoStack.push(transaction);
      };

      EgmGraph.prototype.redo = function() {
        var transaction;
        if (!this.canRedo()) {
          throw new Error('Redo stack is empty');
        }
        transaction = redoStack.pop();
        transaction.execute();
        undoStack.push(transaction);
      };

      return EgmGraph;

    })();
    return new EgmGraph;
  };

}).call(this);

},{"eg-graph/lib/graph":13}],11:[function(require,module,exports){
(function() {
  module.exports = {
    grid: require('./grid'),
    ui: require('./ui')
  };

}).call(this);

},{"./grid":10,"./ui":12}],12:[function(require,module,exports){
(function() {
  module.exports = {
    removeButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_207_remove_2.png',
        onClick: function(d, u) {
          grid.removeConstruct(u);
          return callback();
        }
      };
    },
    editButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_030_pencil.png',
        onClick: function(d, u) {
          var text;
          text = prompt();
          if (text != null) {
            grid.updateConstruct(u, 'text', text);
            return callback();
          }
        }
      };
    },
    ladderUpButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_210_left_arrow.png',
        onClick: function(d, u) {
          var text;
          text = prompt();
          if (text != null) {
            grid.ladderUp(u, text);
            return callback();
          }
        }
      };
    },
    ladderDownButton: function(grid, callback) {
      return {
        icon: 'images/glyphicons_211_right_arrow.png',
        onClick: function(d, u) {
          var text;
          text = prompt();
          if (text != null) {
            grid.ladderDown(u, text);
            return callback();
          }
        }
      };
    }
  };

}).call(this);

},{}],13:[function(require,module,exports){
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _WeakMap = require('babel-runtime/core-js/weak-map')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

_Object$defineProperty(exports, '__esModule', {
  value: true
});

'use strict';

var privates = new _WeakMap();

var p = function p(self) {
  return privates.get(self);
};

var Graph = (function () {
  function Graph() {
    var idOffset = arguments[0] === undefined ? 0 : arguments[0];

    _classCallCheck(this, Graph);

    privates.set(this, {
      vertices: {},
      numVertices: 0,
      numEdges: 0,
      idOffset: idOffset
    });
  }

  _createClass(Graph, [{
    key: 'vertex',
    value: function vertex(u) {
      if (p(this).vertices[u]) {
        return p(this).vertices[u].data;
      }
      return null;
    }
  }, {
    key: 'edge',
    value: function edge(u, v) {
      if (p(this).vertices[u] && p(this).vertices[u].outVertices[v]) {
        return p(this).vertices[u].outVertices[v];
      }
      return null;
    }
  }, {
    key: 'vertices',
    value: function vertices() {
      return _Object$keys(p(this).vertices).map(function (u) {
        return +u;
      });
    }
  }, {
    key: 'edges',
    value: (function (_edges) {
      function edges() {
        return _edges.apply(this, arguments);
      }

      edges.toString = function () {
        return _edges.toString();
      };

      return edges;
    })(function () {
      var edges = [];
      for (var u in p(this).vertices) {
        for (var v in p(this).vertices[u].outVertices) {
          edges.push([+u, +v]);
        }
      }
      return edges;
    })
  }, {
    key: 'outVertices',
    value: function outVertices(u) {
      return _Object$keys(p(this).vertices[u].outVertices).map(function (v) {
        return +v;
      });
    }
  }, {
    key: 'inVertices',
    value: function inVertices(u) {
      return _Object$keys(p(this).vertices[u].inVertices).map(function (v) {
        return +v;
      });
    }
  }, {
    key: 'outEdges',
    value: _regeneratorRuntime.mark(function outEdges(u) {
      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, v;

      return _regeneratorRuntime.wrap(function outEdges$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            context$2$0.prev = 3;
            _iterator = _getIterator(this.outVertices(u));

          case 5:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              context$2$0.next = 12;
              break;
            }

            v = _step.value;
            context$2$0.next = 9;
            return [u, v];

          case 9:
            _iteratorNormalCompletion = true;
            context$2$0.next = 5;
            break;

          case 12:
            context$2$0.next = 18;
            break;

          case 14:
            context$2$0.prev = 14;
            context$2$0.t0 = context$2$0['catch'](3);
            _didIteratorError = true;
            _iteratorError = context$2$0.t0;

          case 18:
            context$2$0.prev = 18;
            context$2$0.prev = 19;

            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }

          case 21:
            context$2$0.prev = 21;

            if (!_didIteratorError) {
              context$2$0.next = 24;
              break;
            }

            throw _iteratorError;

          case 24:
            return context$2$0.finish(21);

          case 25:
            return context$2$0.finish(18);

          case 26:
          case 'end':
            return context$2$0.stop();
        }
      }, outEdges, this, [[3, 14, 18, 26], [19,, 21, 25]]);
    })
  }, {
    key: 'inEdges',
    value: _regeneratorRuntime.mark(function inEdges(u) {
      var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, v;

      return _regeneratorRuntime.wrap(function inEdges$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            context$2$0.prev = 3;
            _iterator2 = _getIterator(this.inVertices(u));

          case 5:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              context$2$0.next = 12;
              break;
            }

            v = _step2.value;
            context$2$0.next = 9;
            return [v, u];

          case 9:
            _iteratorNormalCompletion2 = true;
            context$2$0.next = 5;
            break;

          case 12:
            context$2$0.next = 18;
            break;

          case 14:
            context$2$0.prev = 14;
            context$2$0.t1 = context$2$0['catch'](3);
            _didIteratorError2 = true;
            _iteratorError2 = context$2$0.t1;

          case 18:
            context$2$0.prev = 18;
            context$2$0.prev = 19;

            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }

          case 21:
            context$2$0.prev = 21;

            if (!_didIteratorError2) {
              context$2$0.next = 24;
              break;
            }

            throw _iteratorError2;

          case 24:
            return context$2$0.finish(21);

          case 25:
            return context$2$0.finish(18);

          case 26:
          case 'end':
            return context$2$0.stop();
        }
      }, inEdges, this, [[3, 14, 18, 26], [19,, 21, 25]]);
    })
  }, {
    key: 'numVertices',
    value: function numVertices() {
      return p(this).numVertices;
    }
  }, {
    key: 'numEdges',
    value: function numEdges() {
      return p(this).numEdges;
    }
  }, {
    key: 'outDegree',
    value: function outDegree(u) {
      return _Object$keys(p(this).vertices[u].outVertices).length;
    }
  }, {
    key: 'inDegree',
    value: function inDegree(u) {
      return _Object$keys(p(this).vertices[u].inVertices).length;
    }
  }, {
    key: 'addVertex',
    value: function addVertex(u, obj) {
      var _this = this;

      var nextVertexId = function nextVertexId() {
        while (p(_this).vertices[p(_this).idOffset]) {
          p(_this).idOffset++;
        }
        return p(_this).idOffset++;
      };

      if (u === undefined) {
        u = {};
      }
      if (obj === undefined) {
        obj = u;
        u = nextVertexId();
      }
      if (this.vertex(u)) {
        p(this).vertices[u].data = obj;
      } else {
        p(this).vertices[u] = {
          outVertices: {},
          inVertices: {},
          children: new _Set(),
          parents: new _Set(),
          data: obj
        };
        p(this).numVertices++;
      }
      return u;
    }
  }, {
    key: 'addEdge',
    value: function addEdge(u, v) {
      var obj = arguments[2] === undefined ? {} : arguments[2];

      if (!this.edge(u, v)) {
        p(this).numEdges++;
      }
      p(this).vertices[u].outVertices[v] = obj;
      p(this).vertices[v].inVertices[u] = obj;
    }
  }, {
    key: 'addChild',
    value: function addChild(u, v) {
      p(this).vertices[u].children.add(u);
      p(this).vertices[v].parents.add(v);
    }
  }, {
    key: 'removeVertex',
    value: function removeVertex(u) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = _getIterator(this.outVertices(u)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var v = _step3.value;

          this.removeEdge(u, v);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _getIterator(this.inVertices(u)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var v = _step4.value;

          this.removeEdge(v, u);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      delete p(this).vertices[u];
      p(this).numVertices--;
    }
  }, {
    key: 'removeEdge',
    value: function removeEdge(u, v) {
      delete p(this).vertices[u].outVertices[v];
      delete p(this).vertices[v].inVertices[u];
      p(this).numEdges--;
    }
  }, {
    key: 'toString',
    value: function toString() {
      var _this2 = this;

      var obj = {
        vertices: this.vertices().map(function (u) {
          return { u: u, d: _this2.vertex(u) };
        }),
        edges: this.edges().map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var u = _ref2[0];
          var v = _ref2[1];
          return { u: u, v: v, d: _this2.edge(u, v) };
        })
      };
      return JSON.stringify(obj);
    }
  }]);

  return Graph;
})();

exports['default'] = Graph;
module.exports = exports['default'];
},{"babel-runtime/core-js/get-iterator":14,"babel-runtime/core-js/object/define-property":17,"babel-runtime/core-js/object/keys":18,"babel-runtime/core-js/set":20,"babel-runtime/core-js/weak-map":23,"babel-runtime/helpers/class-call-check":24,"babel-runtime/helpers/create-class":25,"babel-runtime/helpers/sliced-to-array":26,"babel-runtime/regenerator":80}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":27}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":28}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":29}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":30}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":31}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":32}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":33}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":34}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":35}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/weak-map"), __esModule: true };
},{"core-js/library/fn/weak-map":36}],24:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],25:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":17}],26:[function(require,module,exports){
"use strict";

var _getIterator = require("babel-runtime/core-js/get-iterator")["default"];

var _isIterable = require("babel-runtime/core-js/is-iterable")["default"];

exports["default"] = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = _getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (_isIterable(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/get-iterator":14,"babel-runtime/core-js/is-iterable":15}],27:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
require('../modules/core.iter-helpers');
module.exports = require('../modules/$').core.getIterator;
},{"../modules/$":56,"../modules/core.iter-helpers":69,"../modules/es6.string.iterator":75,"../modules/web.dom.iterable":79}],28:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
require('../modules/core.iter-helpers');
module.exports = require('../modules/$').core.isIterable;
},{"../modules/$":56,"../modules/core.iter-helpers":69,"../modules/es6.string.iterator":75,"../modules/web.dom.iterable":79}],29:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":56}],30:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":56}],31:[function(require,module,exports){
require('../../modules/es6.object.statics-accept-primitives');
module.exports = require('../../modules/$').core.Object.keys;
},{"../../modules/$":56,"../../modules/es6.object.statics-accept-primitives":71}],32:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$').core.Promise;
},{"../modules/$":56,"../modules/es6.object.to-string":72,"../modules/es6.promise":73,"../modules/es6.string.iterator":75,"../modules/web.dom.iterable":79}],33:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
module.exports = require('../modules/$').core.Set;
},{"../modules/$":56,"../modules/es6.object.to-string":72,"../modules/es6.set":74,"../modules/es6.string.iterator":75,"../modules/es7.set.to-json":78,"../modules/web.dom.iterable":79}],34:[function(require,module,exports){
require('../../modules/es6.symbol');
module.exports = require('../../modules/$').core.Symbol;
},{"../../modules/$":56,"../../modules/es6.symbol":76}],35:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/$.wks')('iterator');
},{"../../modules/$.wks":68,"../../modules/es6.string.iterator":75,"../../modules/web.dom.iterable":79}],36:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.array.iterator');
require('../modules/es6.weak-map');
module.exports = require('../modules/$').core.WeakMap;
},{"../modules/$":56,"../modules/es6.array.iterator":70,"../modules/es6.object.to-string":72,"../modules/es6.weak-map":77}],37:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = Object($.assertDefined($this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":56,"./$.ctx":44}],38:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":56}],39:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":56,"./$.wks":68}],40:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , step     = require('./$.iter').step
  , $has     = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , isExtensible = Object.isExtensible || isObject
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!$has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      assert.inst(that, C, NAME);
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function(C, NAME, IS_MAP){
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
  }
};
},{"./$":56,"./$.assert":38,"./$.ctx":44,"./$.for-of":48,"./$.iter":55,"./$.iter-define":53,"./$.mix":58,"./$.uid":66}],41:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
module.exports = function(NAME){
  $def($def.P, NAME, {
    toJSON: function toJSON(){
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};
},{"./$.def":45,"./$.for-of":48}],42:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.for-of')
  , $has      = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isExtensible = Object.isExtensible || isObject
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      $.set(assert.inst(that, C, NAME), ID, id++);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this)['delete'](key);
        return $has(key, WEAK) && $has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this).has(key);
        return $has(key, WEAK) && $has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(!isExtensible(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      $has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":56,"./$.array-methods":37,"./$.assert":38,"./$.for-of":48,"./$.mix":58,"./$.uid":66}],43:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , BUGGY = $iter.BUGGY
  , forOf = require('./$.for-of')
  , assertInstance = require('./$.assert').inst
  , INTERNAL = require('./$.uid').safe('internal');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!$.DESC || !$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    require('./$.mix')(C.prototype, methods);
  } else {
    C = wrapper(function(target, iterable){
      assertInstance(target, C, NAME);
      target[INTERNAL] = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','),function(KEY){
      var chain = KEY == 'add' || KEY == 'set';
      if(KEY in proto)$.hide(C.prototype, KEY, function(a, b){
        var result = this[INTERNAL][KEY](a === 0 ? 0 : a, b);
        return chain ? this : result;
      });
    });
    if('size' in proto)$.setDesc(C.prototype, 'size', {
      get: function(){
        return this[INTERNAL].size;
      }
    });
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F, O);
  require('./$.species')(C);

  if(!IS_WEAK)common.setIter(C, NAME, IS_MAP);

  return C;
};
},{"./$":56,"./$.assert":38,"./$.cof":39,"./$.def":45,"./$.for-of":48,"./$.iter":55,"./$.mix":58,"./$.species":63,"./$.uid":66}],44:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":38}],45:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    if(isGlobal && !isFunction(target[key]))exp = source[key];
    // bind timers to global for call from export context
    else if(type & $def.B && own)exp = ctx(out, global);
    // wrap global constructors for prevent change them in library
    else if(type & $def.W && target[key] == out)!function(C){
      exp = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      exp.prototype = C.prototype;
    }(out);
    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
    // export
    exports[key] = exp;
    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$":56}],46:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":56}],47:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":56}],48:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":44,"./$.iter":55,"./$.iter-call":52}],49:[function(require,module,exports){
module.exports = function($){
  $.FW   = false;
  $.path = $.core;
  return $;
};
},{}],50:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var $ = require('./$')
  , toString = {}.toString
  , getNames = $.getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames($.toObject(it));
};
},{"./$":56}],51:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],52:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":38}],53:[function(require,module,exports){
var $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW || FORCE)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":56,"./$.cof":39,"./$.def":45,"./$.iter":55,"./$.redef":59,"./$.wks":68}],54:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":68}],55:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , classof           = cof.classof
  , assert            = require('./$.assert')
  , assertObject      = assert.obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = require('./$.shared')('iterators')
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol;
    return (Symbol && Symbol.iterator || FF_ITERATOR) in O
      || SYMBOL_ITERATOR in O
      || $.has(Iterators, classof(O));
  },
  get: function(it){
    var Symbol = $.g.Symbol
      , getIter;
    if(it != undefined){
      getIter = it[Symbol && Symbol.iterator || FF_ITERATOR]
        || it[SYMBOL_ITERATOR]
        || Iterators[classof(it)];
    }
    assert($.isFunction(getIter), it, ' is not iterable!');
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":56,"./$.assert":38,"./$.cof":39,"./$.shared":62,"./$.wks":68}],56:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":49}],57:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":56}],58:[function(require,module,exports){
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":59}],59:[function(require,module,exports){
module.exports = require('./$').hide;
},{"./$":56}],60:[function(require,module,exports){
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],61:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":56,"./$.assert":38,"./$.ctx":44}],62:[function(require,module,exports){
var $      = require('./$')
  , SHARED = '__core-js_shared__'
  , store  = $.g[SHARED] || ($.g[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$":56}],63:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":56,"./$.wks":68}],64:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":56}],65:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(global.addEventListener && isFunction(global.postMessage) && !global.importScripts){
    defer = function(id){
      global.postMessage(id, '*');
    };
    global.addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":56,"./$.cof":39,"./$.ctx":44,"./$.dom-create":46,"./$.invoke":51}],66:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":56}],67:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],68:[function(require,module,exports){
var global = require('./$').g
  , store  = require('./$.shared')('wks');
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":56,"./$.shared":62,"./$.uid":66}],69:[function(require,module,exports){
var core  = require('./$').core
  , $iter = require('./$.iter');
core.isIterable  = $iter.is;
core.getIterator = $iter.get;
},{"./$":56,"./$.iter":55}],70:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":56,"./$.iter":55,"./$.iter-define":53,"./$.uid":66,"./$.unscope":67}],71:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : require('./$.get-names').get;
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":56,"./$.def":45,"./$.get-names":50}],72:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if(require('./$').FW && cof(tmp) != 'z'){
  require('./$.redef')(Object.prototype, 'toString', function toString(){
    return '[object ' + cof.classof(this) + ']';
  }, true);
}
},{"./$":56,"./$.cof":39,"./$.redef":59,"./$.wks":68}],73:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , same     = require('./$.same')
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , isNode   = cof(process) == 'process'
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , Wrapper;

function testResolve(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
}

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && $.DESC){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function isPromise(it){
  return isObject(it) && (useNative ? cof.classof(it) == 'Promise' : RECORD in it);
}
function sameConstructor(a, b){
  // library wrapper special case
  if(!$.FW && a === P && b === Wrapper)return true;
  return same(a, b);
}
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  // strange IE + webpack dev server bug - use .call(global)
  if(chain.length)asap.call(global, function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    // strange IE + webpack dev server bug - use .call(global)
    asap.call(global, function(){
      if(isUnhandled(promise = record.p)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && console.error){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      // strange IE + webpack dev server bug - use .call(global)
      asap.call(global, function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      if(record.s)notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species(Wrapper = $.core[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){ rej(r); });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isPromise(x) && sameConstructor(x.constructor, this)
      ? x : new this(function(res){ res(x); });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":56,"./$.assert":38,"./$.cof":39,"./$.ctx":44,"./$.def":45,"./$.for-of":48,"./$.iter-detect":54,"./$.mix":58,"./$.same":60,"./$.set-proto":61,"./$.species":63,"./$.task":65,"./$.uid":66,"./$.wks":68}],74:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', function(get){
  return function Set(){ return get(this, arguments[0]); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":43,"./$.collection-strong":40}],75:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":56,"./$.iter":55,"./$.iter-define":53,"./$.string-at":64,"./$.uid":66}],76:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , shared   = require('./$.shared')
  , $def     = require('./$.def')
  , $redef   = require('./$.redef')
  , keyOf    = require('./$.keyof')
  , enumKeys = require('./$.enum-keys')
  , assertObject = require('./$.assert').obj
  , ObjectProto = Object.prototype
  , DESC     = $.DESC
  , has      = $.has
  , $create  = $.create
  , getDesc  = $.getDesc
  , setDesc  = $.setDesc
  , desc     = $.desc
  , $names   = require('./$.get-names')
  , getNames = $names.get
  , toObject = $.toObject
  , $Symbol  = $.g.Symbol
  , setter   = false
  , TAG      = uid('tag')
  , HIDDEN   = uid('hidden')
  , _propertyIsEnumerable = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols = shared('symbols')
  , useNative = $.isFunction($Symbol);

var setSymbolDesc = DESC ? function(){ // fallback for old Android
  try {
    return $create(setDesc({}, HIDDEN, {
      get: function(){
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }
    }))[HIDDEN] || setDesc;
  } catch(e){
    return function(it, key, D){
      var protoDesc = getDesc(ObjectProto, key);
      if(protoDesc)delete ObjectProto[key];
      setDesc(it, key, D);
      if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = $create(D, {enumerable: desc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  assertObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function propertyIsEnumerable(key){
  var E = _propertyIsEnumerable.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = $names.get = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;

  if($.DESC && $.FW)$redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":56,"./$.assert":38,"./$.cof":39,"./$.def":45,"./$.enum-keys":47,"./$.get-names":50,"./$.keyof":57,"./$.redef":59,"./$.shared":62,"./$.uid":66,"./$.wks":68}],77:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isExtensible = Object.isExtensible || isObject
  , tmp       = {};

// 23.3 WeakMap Objects
var $WeakMap = require('./$.collection')('WeakMap', function(get){
  return function WeakMap(){ return get(this, arguments[0]); };
}, {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(!isExtensible(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    require('./$.redef')(proto, key, function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && !isExtensible(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./$":56,"./$.collection":43,"./$.collection-weak":42,"./$.redef":59}],78:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":41}],79:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NL          = $.g.NodeList
  , HTC         = $.g.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype;
if($.FW){
  if(NL && !(ITERATOR in NLProto))$.hide(NLProto, ITERATOR, ArrayValues);
  if(HTC && !(ITERATOR in HTCProto))$.hide(HTCProto, ITERATOR, ArrayValues);
}
Iterators.NodeList = Iterators.HTMLCollection = ArrayValues;
},{"./$":56,"./$.iter":55,"./$.wks":68,"./es6.array.iterator":70}],80:[function(require,module,exports){
(function (global){
// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g =
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime &&
  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

module.exports = require("./runtime");

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  delete g.regeneratorRuntime;
}

module.exports = { "default": module.exports, __esModule: true };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./runtime":81}],81:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

"use strict";

var _Symbol = require("babel-runtime/core-js/symbol")["default"];

var _Symbol$iterator = require("babel-runtime/core-js/symbol/iterator")["default"];

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Promise = require("babel-runtime/core-js/promise")["default"];

!(function (global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol = typeof _Symbol === "function" && _Symbol$iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = _Object$create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(innerFn, self || null, new Context(tryLocsList || []));

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      prototype[method] = function (arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction ||
    // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  runtime.mark = function (genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = _Object$create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function (arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument ? _Promise.resolve(value.arg).then(invokeNext, invokeThrow) : _Promise.resolve(value).then(function (unwrapped) {
        result.value = unwrapped;
        return result;
      }, invokeThrow);
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      var enqueueResult =
      // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(function () {
        return invoke(method, arg);
      }) : new _Promise(function (resolve) {
        resolve(invoke(method, arg));
      });

      // Avoid propagating enqueueResult failures to Promises returned by
      // later invocations of the iterator, and call generator.return() to
      // allow the generator a chance to clean up.
      previousPromise = enqueueResult["catch"](invokeReturn);

      return enqueueResult;
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function (innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

    return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }
        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }
        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }
        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function (object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function reset() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName; hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20; ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function stop() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
// Among the various tricks for obtaining a reference to the global
// object, this seems to be the most reliable technique that does not
// use indirect eval (which violates Content Security Policy).
typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined);
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":82,"babel-runtime/core-js/object/create":16,"babel-runtime/core-js/promise":19,"babel-runtime/core-js/symbol":21,"babel-runtime/core-js/symbol/iterator":22}],82:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[9]);
