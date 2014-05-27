(function() {
  var graph;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.graph) {
    this.egrid.core.graph = {};
  }

  graph = this.egrid.core.graph;

  graph.adjacencyList = function() {
    var AdjacencyList, nextVertexId, vertices;
    nextVertexId = 0;
    vertices = {};
    AdjacencyList = (function() {
      function AdjacencyList() {}

      AdjacencyList.prototype.vertices = function() {
        var u, _results;
        _results = [];
        for (u in vertices) {
          _results.push(u);
        }
        return _results;
      };

      AdjacencyList.prototype.edges = function() {
        var u, _ref;
        return (_ref = []).concat.apply(_ref, (function() {
          var _i, _len, _ref, _results;
          _ref = this.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            u = _ref[_i];
            _results.push(this.outEdges(u));
          }
          return _results;
        }).call(this));
      };

      AdjacencyList.prototype.adjacentVertices = function(u) {
        var v, _results;
        _results = [];
        for (v in vertices[u].outAdjacencies) {
          _results.push(v);
        }
        return _results;
      };

      AdjacencyList.prototype.invAdjacentVertices = function(u) {
        var v, _results;
        _results = [];
        for (v in vertices[u].inAdjacencies) {
          _results.push(v);
        }
        return _results;
      };

      AdjacencyList.prototype.outEdges = function(u) {
        var v, _results;
        _results = [];
        for (v in vertices[u].outAdjacencies) {
          _results.push([u, v]);
        }
        return _results;
      };

      AdjacencyList.prototype.inEdges = function(u) {
        var v, _i, _len, _ref, _results;
        _ref = vertices[u].inAdjacencies;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          _results.push([v, u]);
        }
        return _results;
      };

      AdjacencyList.prototype.outDegree = function(u) {
        return Object.keys(vertices[u].outAdjacencies).length;
      };

      AdjacencyList.prototype.inDegree = function(u) {
        return Object.keys(vertices[u].inAdjacencies).length;
      };

      AdjacencyList.prototype.numVertices = function() {
        return Object.keys(vertices).length;
      };

      AdjacencyList.prototype.numEdges = function() {
        var i;
        return ((function() {
          var _i, _len, _ref, _results;
          _ref = this.vertices();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(this.outDegree(i));
          }
          return _results;
        }).call(this)).reduce(function(t, s) {
          return t + s;
        });
      };

      AdjacencyList.prototype.vertex = function(u) {
        return u;
      };

      AdjacencyList.prototype.edge = function(u, v) {
        return vertices[u].outAdjacencies[v] != null;
      };

      AdjacencyList.prototype.addEdge = function(u, v, prop) {
        if (prop == null) {
          prop = {};
        }
        vertices[u].outAdjacencies[v] = prop;
        vertices[v].inAdjacencies[u] = prop;
        return [u, v];
      };

      AdjacencyList.prototype.removeEdge = function(u, v) {
        delete vertices[u].outAdjacencies[v];
        delete vertices[v].inAdjacencies[u];
      };

      AdjacencyList.prototype.addVertex = function(prop) {
        vertices[nextVertexId] = {
          outAdjacencies: {},
          inAdjacencies: {},
          property: prop
        };
        return nextVertexId++;
      };

      AdjacencyList.prototype.clearVertex = function(u) {
        var v;
        vertices[u].outAdjacencies = {};
        outAdjacencies[i] = {};
        for (v in vertices[u].inAdjacencies) {
          delete vertices[v].inAdjacencies[u];
        }
      };

      AdjacencyList.prototype.removeVertex = function(u) {
        delete vertices[u];
      };

      AdjacencyList.prototype.get = function(u, v) {
        if (v != null) {
          return vertices[u].outAdjacencies[v];
        } else {
          return vertices[u].property;
        }
      };

      return AdjacencyList;

    })();
    return new AdjacencyList;
  };

}).call(this);

(function() {
  var graph;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.graph) {
    this.egrid.core.graph = {};
  }

  graph = this.egrid.core.graph;

  graph.dijkstra = function() {
    var dijkstra, inv, weight;
    weight = function(p) {
      return p.weight;
    };
    inv = false;
    dijkstra = function(graph, i) {
      var adjacentVertices, distance, distances, j, queue, u, v, _i, _len, _ref;
      adjacentVertices = inv ? function(u) {
        return graph.invAdjacentVertices(u);
      } : function(u) {
        return graph.adjacentVertices(u);
      };
      distances = {};
      for (j in graph.vertices()) {
        distances[j] = Infinity;
      }
      distances[i] = 0;
      queue = [i];
      while (queue.length > 0) {
        u = queue.pop();
        _ref = adjacentVertices(u);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          v = _ref[_i];
          if (distances[v] === Infinity) {
            queue.push(v);
          }
          distance = distances[u] + weight(graph.get(u, v));
          if (distance < distances[v]) {
            distances[v] = distance;
          }
        }
      }
      return distances;
    };
    dijkstra.weight = function(f) {
      if (f != null) {
        weight = f;
        return dijkstra;
      } else {
        return weight;
      }
    };
    dijkstra.inv = function(flag) {
      if (flag != null) {
        inv = flag;
        return dijkstra;
      } else {
        return inv;
      }
    };
    return dijkstra;
  };

}).call(this);

(function() {
  var graph;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.graph) {
    this.egrid.core.graph = {};
  }

  graph = this.egrid.core.graph;

  graph.warshallFloyd = function() {
    var warshallFloyd, weight;
    weight = function(p) {
      return p.weight;
    };
    warshallFloyd = function(graph) {
      var distance, distances, i, j, k, u, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      distances = {};
      _ref = graph.vertices();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        u = _ref[_i];
        distances[u] = {};
        _ref1 = graph.vertices();
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          distances[u][v] = Infinity;
        }
        distances[u][u] = 0;
        _ref2 = graph.adjacentVertices(u);
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          v = _ref2[_k];
          distances[u][v] = weight(graph.get(u, v));
        }
      }
      _ref3 = graph.vertices();
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        k = _ref3[_l];
        _ref4 = graph.vertices();
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          i = _ref4[_m];
          _ref5 = graph.vertices();
          for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
            j = _ref5[_n];
            distance = distances[i][k] + distances[k][j];
            if (distance < distances[i][j]) {
              distances[i][j] = distance;
            }
          }
        }
      }
      return distances;
    };
    warshallFloyd.weight = function(f) {
      if (f != null) {
        weight = f;
        return warshallFloyd;
      } else {
        return weight;
      }
    };
    return warshallFloyd;
  };

}).call(this);

(function() {
  var centrality;

  if (!egrid) {
    this.egrid = {};
  }

  if (!egrid.core) {
    this.egrid.core = {};
  }

  if (!egrid.core.network) {
    this.egrid.core.network = {};
  }

  if (!egrid.core.network.centrality) {
    this.egrid.core.network.centrality = {};
  }

  centrality = this.egrid.core.network.centrality;

  centrality.inDegree = function(graph) {
    var u, _i, _len, _ref, _results;
    _ref = graph.vertices();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      _results.push(graph.inDegree(u));
    }
    return _results;
  };

  centrality.outDegree = function(graph) {
    var u, _i, _len, _ref, _results;
    _ref = graph.vertices();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      _results.push(graph.outDegree(u));
    }
    return _results;
  };

  centrality.degree = function(graph) {
    var u, _i, _len, _ref, _results;
    _ref = graph.vertices();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      u = _ref[_i];
      _results.push(graph.inDegree(u) + graph.outDegree(u));
    }
    return _results;
  };

}).call(this);
