var egrid;
(function (egrid) {
    (function (svg) {
        (function (_transform) {
            var Translate = (function () {
                function Translate(tx, ty) {
                    this.tx = tx;
                    this.ty = ty;
                }
                Translate.prototype.toString = function () {
                    return 'translate(' + this.tx + ',' + this.ty + ')';
                };
                return Translate;
            })();
            _transform.Translate = Translate;

            var Scale = (function () {
                function Scale(sx, sy) {
                    this.sx = sx;
                    this.sy = sy;
                }
                Scale.prototype.toString = function () {
                    return 'scale(' + this.sx + ',' + this.sy + ')';
                };
                return Scale;
            })();
            _transform.Scale = Scale;

            function translate(tx, ty) {
                if (typeof ty === "undefined") { ty = 0; }
                return new Translate(tx, ty);
            }
            _transform.translate = translate;

            function scale(sx, sy) {
                if (typeof sy === "undefined") { sy = sx; }
                return new Scale(sx, sy);
            }
            _transform.scale = scale;

            function compose() {
                var transforms = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    transforms[_i] = arguments[_i + 0];
                }
                return transforms.map(function (transform) {
                    return transform.toString();
                }).join('');
            }
            _transform.compose = compose;
        })(svg.transform || (svg.transform = {}));
        var transform = svg.transform;
    })(egrid.svg || (egrid.svg = {}));
    var svg = egrid.svg;
})(egrid || (egrid = {}));
var egrid;
(function (egrid) {
    var Impl;
    (function (Impl) {
        var linkLine = d3.svg.line().interpolate('monotone');
        var linkPointsSize = 20;
        var svgCss = '\
g.node > rect, rect.background {\
  fill: mintcream;\
}\
g.link > path {\
  fill: none;\
}\
g.node > rect, g.link > path {\
  stroke: black;\
}\
g.node.lower > rect, g.link.lower > path {\
  stroke: blue;\
}\
g.node.upper > rect, g.link.upper > path {\
  stroke: red;\
}\
g.node.selected > rect {\
  stroke: purple;\
}\
';

        function onClickNode(container, nodeKey) {
            function connectedNodeKeys(node, adjacencies) {
                var fronts = [node];
                var visited = d3.set();
                while (fronts.length > 0) {
                    var front = fronts.pop();
                    var key = nodeKey(front.data);
                    if (!visited.has(key)) {
                        visited.add(key);
                        adjacencies(front).forEach(function (node) {
                            fronts.push(node);
                        });
                    }
                }
                return visited;
            }

            return function (node) {
                var alreadySelected = d3.select(this).classed('selected');

                container.selectAll('g.node').classed('selected', false).classed('lower', false).classed('upper', false);
                container.selectAll('g.link').classed('lower', false).classed('upper', false);

                if (!alreadySelected) {
                    d3.select(this).classed('selected', true);

                    var ancestors = connectedNodeKeys(node, function (node) {
                        return node.parents;
                    });
                    var descendants = connectedNodeKeys(node, function (node) {
                        return node.children;
                    });
                    container.selectAll('g.link').classed('upper', function (link) {
                        return ancestors.has(nodeKey(link.source.data)) && ancestors.has(nodeKey(link.target.data));
                    }).classed('lower', function (link) {
                        return descendants.has(nodeKey(link.source.data)) && descendants.has(nodeKey(link.target.data));
                    });
                    ancestors.remove(nodeKey(node.data));
                    descendants.remove(nodeKey(node.data));
                    container.selectAll('g.node').classed('upper', function (node) {
                        return ancestors.has(nodeKey(node.data));
                    }).classed('lower', function (node) {
                        return descendants.has(nodeKey(node.data));
                    });
                }
            };
        }

        function makeAdjacencyList(nodes, links, linkLower, linkUpper) {
            var adjacencies = nodes.map(function () {
                return {
                    upper: d3.set(),
                    lower: d3.set()
                };
            });
            links.forEach(function (link) {
                adjacencies[linkUpper(link)].lower.add(linkLower(link));
                adjacencies[linkLower(link)].upper.add(linkUpper(link));
            });
            return adjacencies;
        }

        function makeGrid(nodes, links, nodeKey, nodeVisibility, linkLower, linkUpper, oldNodes) {
            var oldNodesMap = {};
            oldNodes.forEach(function (node) {
                oldNodesMap[nodeKey(node.data)] = node;
            });
            var gridNodes = nodes.map(function (nodeData) {
                return oldNodesMap[nodeKey(nodeData)] || {
                    data: nodeData
                };
            });
            var gridLinks = [];
            var adjacencies = makeAdjacencyList(nodes, links, linkLower, linkUpper);
            nodes.forEach(function (node, i) {
                if (!nodeVisibility(node)) {
                    adjacencies[i].upper.forEach(function (upper) {
                        adjacencies[i].lower.forEach(function (lower) {
                            adjacencies[upper].lower.add(lower);
                            adjacencies[lower].upper.add(upper);
                        });
                    });
                    adjacencies[i].upper.forEach(function (upper) {
                        adjacencies[upper].lower.remove(i);
                    });
                    adjacencies[i].lower.forEach(function (lower) {
                        adjacencies[lower].upper.remove(i);
                    });
                    adjacencies[i].upper = d3.set();
                    adjacencies[i].lower = d3.set();
                }
            });
            nodes.forEach(function (node, i) {
                gridNodes[i].parents = adjacencies[i].upper.values().map(function (j) {
                    return gridNodes[j];
                });
                gridNodes[i].children = adjacencies[i].lower.values().map(function (j) {
                    return gridNodes[j];
                });
                adjacencies[i].lower.forEach(function (j) {
                    gridLinks.push({
                        source: gridNodes[i],
                        target: gridNodes[j]
                    });
                });
            });
            return {
                nodes: gridNodes.filter(function (node) {
                    return nodeVisibility(node.data);
                }),
                links: gridLinks
            };
        }

        function calculateTextSize(nodeText) {
            return function (selection) {
                var measure = d3.select('body').append('svg');
                var measureText = measure.append('text');

                selection.each(function (node) {
                    measureText.text(nodeText(node.data));
                    var bbox = measureText.node().getBBox();
                    node.textWidth = bbox.width;
                    node.textHeight = bbox.height;
                });

                measure.remove();
            };
        }

        function createNode() {
            return function (selection) {
                selection.append('rect');
                selection.append('text').each(function (node) {
                    node.x = 0;
                    node.y = 0;
                }).attr({
                    'text-anchor': 'middle',
                    'dominant-baseline': 'text-before-edge'
                });
            };
        }

        function updateNodes(nodeScale, nodeText) {
            var r = 5;
            var strokeWidth = 1;
            return function (selection) {
                selection.enter().append('g').classed('node', true).call(createNode());
                selection.exit().remove();
                selection.call(calculateTextSize(nodeText)).each(function (node) {
                    node.originalWidth = node.textWidth + 2 * r;
                    node.originalHeight = node.textHeight + 2 * r;
                    node.scale = nodeScale(node.data);
                    node.width = (node.originalWidth + strokeWidth) * node.scale;
                    node.height = (node.originalHeight + strokeWidth) * node.scale;
                });
                selection.select('text').text(function (node) {
                    return nodeText(node.data);
                }).attr('y', function (node) {
                    return -node.textHeight / 2;
                });
                selection.select('rect').attr({
                    x: function (node) {
                        return -node.originalWidth / 2;
                    },
                    y: function (node) {
                        return -node.originalHeight / 2;
                    },
                    width: function (node) {
                        return node.originalWidth;
                    },
                    height: function (node) {
                        return node.originalHeight;
                    },
                    rx: r
                });
            };
        }

        function updateLinks() {
            return function (selection) {
                selection.enter().append('g').classed('link', true).append('path').attr('d', function (link) {
                    var points = [];
                    points.push([link.source.x, link.source.y]);
                    for (var i = 1; i < linkPointsSize; ++i) {
                        points.push([link.target.x, link.target.y]);
                    }
                    return linkLine(points);
                });
                selection.exit().remove();
            };
        }

        function update(options) {
            return function (selection) {
                selection.each(function (data) {
                    var container = d3.select(this);
                    if (data) {
                        var oldNodes = [];
                        if (container.select('g.nodes').empty()) {
                            container.append('rect').classed('background', true);
                            container.append('g').classed('links', true);
                            container.append('g').classed('nodes', true);
                        } else {
                            oldNodes = container.selectAll('g.nodes > g.node').data();
                        }
                        var grid = makeGrid(data.nodes, data.links, options.nodeKey, options.nodeVisibility, options.linkLower, options.linkUpper, oldNodes);
                        container.select('g.nodes').selectAll('g.node').data(grid.nodes, function (node) {
                            return options.nodeKey(node.data);
                        }).call(updateNodes(options.nodeScale, options.nodeText)).on('click', onClickNode(container, options.nodeKey));
                        container.select('g.links').selectAll('g.link').data(grid.links, function (link) {
                            return options.nodeKey(link.source.data) + ':' + options.nodeKey(link.target.data);
                        }).call(updateLinks());
                    } else {
                        container.select('g.nodes').remove();
                        container.select('g.links').remove();
                        container.select('rect.background').remove();
                    }
                });
            };
        }

        function layout(options) {
            return function (selection) {
                selection.each(function () {
                    var container = d3.select(this);
                    var nodes = container.selectAll('g.node').data();
                    var links = container.selectAll('g.link').data();
                    nodes.sort(function (node1, node2) {
                        return d3.ascending(options.nodeKey(node1.data), options.nodeKey(node2.data));
                    });
                    links.sort(function (link1, link2) {
                        var key1 = options.nodeKey(link1.source.data) + options.nodeKey(link1.target.data);
                        var key2 = options.nodeKey(link2.source.data) + options.nodeKey(link2.target.data);
                        return d3.ascending(key1, key2);
                    });
                    dagre.layout().nodes(nodes).edges(links).lineUpTop(true).lineUpBottom(true).rankDir('LR').rankSep(200).edgeSep(20).run();
                    nodes.forEach(function (node) {
                        node.x = node.dagre.x;
                        node.y = node.dagre.y;
                    });
                    links.forEach(function (link) {
                        link.points = [];
                        link.points.push([link.source.x, link.source.y]);
                        link.dagre.points.forEach(function (obj) {
                            link.points.push([obj.x, obj.y]);
                        });
                        link.points.push([link.target.x, link.target.y]);
                        for (var i = 0, n = linkPointsSize - link.points.length; i < n; ++i) {
                            link.points.push([link.target.x, link.target.y]);
                        }
                    });
                });
            };
        }

        function transition(options) {
            return function (selection) {
                var nodes = selection.selectAll('g.nodes > g.node').data();
                var links = selection.selectAll('g.links > g.link').data();
                var transition = selection.transition();
                transition.selectAll('g.nodes > g.node').attr('transform', function (node) {
                    return egrid.svg.transform.compose(egrid.svg.transform.translate(node.x, node.y), egrid.svg.transform.scale(node.scale));
                }).style('opacity', function (node) {
                    return options.nodeOpacity(node.data);
                });
                transition.selectAll('g.nodes > g.node > rect').style('fill', function (node) {
                    return options.nodeColor(node.data);
                });
                transition.selectAll('g.links > g.link').select('path').attr('d', function (link) {
                    return linkLine(link.points);
                });
            };
        }

        function call(selection, that) {
            var size = that.size();
            selection.call(update({
                linkLower: that.linkLower(),
                linkUpper: that.linkUpper(),
                nodeKey: that.nodeKey(),
                nodeScale: that.nodeScale(),
                nodeText: that.nodeText(),
                nodeVisibility: that.nodeVisibility()
            })).call(resize(size[0], size[1])).call(layout({
                nodeKey: that.nodeKey()
            })).call(transition({
                nodeColor: that.nodeColor(),
                nodeOpacity: that.nodeOpacity()
            }));
        }
        Impl.call = call;

        function css() {
            return function (selection) {
                selection.append('defs').append('style').text(svgCss);
            };
        }
        Impl.css = css;

        function resize(width, height) {
            return function (selection) {
                selection.attr({
                    width: width,
                    height: height
                });
                selection.select('rect.background').attr({
                    width: width,
                    height: height
                });
            };
        }
        Impl.resize = resize;
    })(Impl || (Impl = {}));

    function egm(options) {
        if (typeof options === "undefined") { options = {}; }
        function accessor(key) {
            var val;
            return function (arg) {
                if (arg === undefined) {
                    return val;
                }
                val = arg;
                return this;
            };
        }
        var optionAttributes = [
            'enableClickNode',
            'linkLower',
            'linkUpper',
            'nodeColor',
            'nodeKey',
            'nodeOpacity',
            'nodeScale',
            'nodeText',
            'nodeVisibility',
            'size'
        ];
        var f = function EGM(selection) {
            return Impl.call(selection, f);
        };

        f.css = Impl.css;

        f.resize = Impl.resize;

        f.options = function (options) {
            var _this = this;
            optionAttributes.forEach(function (attr) {
                _this[attr](options[attr]);
            });
            return this;
        };

        optionAttributes.forEach(function (attr) {
            f[attr] = accessor(attr + '_');
        });

        f.options({
            enableClickNode: true,
            linkLower: function (linkData) {
                return linkData.lower;
            },
            linkUpper: function (linkData) {
                return linkData.upper;
            },
            nodeColor: function () {
                return '';
            },
            nodeOpacity: function () {
                return 1;
            },
            nodeScale: function () {
                return 1;
            },
            nodeText: function (nodeData) {
                return nodeData.text;
            },
            nodeVisibility: function () {
                return true;
            },
            size: [1, 1]
        });
        return f.options(options).nodeKey(function (nodeData) {
            return f.nodeText()(nodeData);
        });
    }
    egrid.egm = egm;
})(egrid || (egrid = {}));
