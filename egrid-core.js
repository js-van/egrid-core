var Svg;
(function (Svg) {
    (function (Transform) {
        var Translate = (function () {
            function Translate(x, y) {
                this.x = x;
                this.y = y;
            }
            Translate.prototype.toString = function () {
                return "translate(" + this.x + "," + this.y + ")";
            };
            return Translate;
        })();
        Transform.Translate = Translate;

        var Scale = (function () {
            function Scale(sx, sy) {
                if (typeof sy === "undefined") { sy = undefined; }
                this.sx = sx;
                this.sy = sy;
            }
            Scale.prototype.toString = function () {
                if (this.sy) {
                    return "scale(" + this.sx + "," + this.sy + ")";
                } else {
                    return "scale(" + this.sx + ")";
                }
            };
            return Scale;
        })();
        Transform.Scale = Scale;

        var Rotate = (function () {
            function Rotate(angle) {
                this.angle = angle;
            }
            Rotate.prototype.toString = function () {
                return "rotate(" + this.angle + ")";
            };
            return Rotate;
        })();
        Transform.Rotate = Rotate;
    })(Svg.Transform || (Svg.Transform = {}));
    var Transform = Svg.Transform;

    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    })();
    Svg.Point = Point;

    var Rect = (function () {
        function Rect(x, y, width, height, theta) {
            if (typeof theta === "undefined") { theta = 0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.theta = theta;
        }
        Rect.prototype.left = function () {
            return new Point(-this.width / 2 * Math.cos(this.theta) + this.x, this.width / 2 * Math.sin(this.theta) + this.y);
        };

        Rect.prototype.right = function () {
            return new Point(this.width / 2 * Math.cos(this.theta) + this.x, this.width / 2 * Math.sin(this.theta) + this.y);
        };

        Rect.prototype.top = function () {
            return new Point(this.height / 2 * Math.sin(this.theta) + this.x, -this.height / 2 * Math.cos(this.theta) + this.y);
        };

        Rect.prototype.bottom = function () {
            return new Point(this.height / 2 * Math.sin(this.theta) + this.x, this.height / 2 * Math.cos(this.theta) + this.y);
        };

        Rect.prototype.center = function () {
            return new Point(this.x, this.y);
        };

        Rect.left = function (x, y, width, height, theta) {
            if (typeof theta === "undefined") { theta = 0; }
            return new Point(-width / 2 * Math.cos(theta) + x, width / 2 * Math.sin(theta) + y);
        };

        Rect.right = function (x, y, width, height, theta) {
            if (typeof theta === "undefined") { theta = 0; }
            return new Point(width / 2 * Math.cos(theta) + x, width / 2 * Math.sin(theta) + y);
        };

        Rect.top = function (x, y, width, height, theta) {
            if (typeof theta === "undefined") { theta = 0; }
            return new Point(height / 2 * Math.sin(theta) + x, -height / 2 * Math.cos(theta) + y);
        };

        Rect.bottom = function (x, y, width, height, theta) {
            if (typeof theta === "undefined") { theta = 0; }
            return new Point(height / 2 * Math.sin(theta) + x, height / 2 * Math.cos(theta) + y);
        };

        Rect.center = function (x, y, width, height, theta) {
            if (typeof theta === "undefined") { theta = 0; }
            return new Point(x, y);
        };
        return Rect;
    })();
    Svg.Rect = Rect;

    var ViewBox = (function () {
        function ViewBox(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        ViewBox.prototype.toString = function () {
            return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
        };
        return ViewBox;
    })();
    Svg.ViewBox = ViewBox;
})(Svg || (Svg = {}));
var egrid;
(function (egrid) {
    var Node = (function () {
        function Node(text, weight, original, participants) {
            if (typeof weight === "undefined") { weight = 1; }
            if (typeof original === "undefined") { original = false; }
            if (typeof participants === "undefined") { participants = []; }
            this.text = text;
            this.weight = weight;
            this.original = original;
            this.participants = participants;
            this.x = 0;
            this.y = 0;
            this.theta = 0;
            this.active = true;
            this.visible = true;
            this.key = Node.nextKey++;
        }
        Node.prototype.left = function () {
            return Svg.Rect.left(this.x, this.y, this.width, this.height);
        };

        Node.prototype.right = function () {
            return Svg.Rect.right(this.x, this.y, this.width, this.height);
        };

        Node.prototype.top = function () {
            return Svg.Rect.top(this.x, this.y, this.width, this.height);
        };

        Node.prototype.bottom = function () {
            return Svg.Rect.bottom(this.x, this.y, this.width, this.height);
        };

        Node.prototype.center = function () {
            return Svg.Rect.center(this.x, this.y, this.width, this.height);
        };

        Node.prototype.toString = function () {
            return this.key.toString();
        };
        Node.nextKey = 0;
        return Node;
    })();
    egrid.Node = Node;

    var Link = (function () {
        function Link(source, target, weight) {
            if (typeof weight === "undefined") { weight = 1; }
            this.source = source;
            this.target = target;
            this.weight = weight;
            this.key = Link.nextKey++;
        }
        Link.prototype.toString = function () {
            return this.key.toString();
        };
        Link.nextKey = 0;
        return Link;
    })();
    egrid.Link = Link;

    var CommandTransaction = (function () {
        function CommandTransaction() {
            this.commands = [];
        }
        CommandTransaction.prototype.execute = function () {
            this.commands.forEach(function (command) {
                command.execute();
            });
        };

        CommandTransaction.prototype.revert = function () {
            this.commands.reverse().forEach(function (command) {
                command.revert();
            });
            this.commands.reverse();
        };

        CommandTransaction.prototype.push = function (command) {
            this.commands.push(command);
        };
        return CommandTransaction;
    })();

    (function (RankDirection) {
        RankDirection[RankDirection["LR"] = 0] = "LR";
        RankDirection[RankDirection["TB"] = 1] = "TB";
    })(egrid.RankDirection || (egrid.RankDirection = {}));
    var RankDirection = egrid.RankDirection;

    var Grid = (function () {
        function Grid() {
            this.nodes_ = [];
            this.links_ = [];
            this.paths = [];
            this.undoStack = [];
            this.redoStack = [];
            this.checkActive_ = false;
            this.minimumWeight_ = 0;
        }
        Grid.prototype.appendNode = function (node) {
            var _this = this;
            this.execute({
                execute: function () {
                    node.index = _this.nodes_.length;
                    _this.nodes_.push(node);
                    _this.updateConnections();
                },
                revert: function () {
                    node.index = undefined;
                    _this.nodes_.pop();
                    _this.updateConnections();
                }
            });
        };

        Grid.prototype.appendLink = function (sourceIndex, targetIndex) {
            var _this = this;
            var sourceNode = this.nodes_[sourceIndex];
            var targetNode = this.nodes_[targetIndex];
            var link = new Link(sourceNode, targetNode);
            this.execute({
                execute: function () {
                    _this.links_.push(link);
                    _this.updateLinkIndex();
                    _this.updateConnections();
                },
                revert: function () {
                    _this.links_.pop();
                    _this.updateLinkIndex();
                    _this.updateConnections();
                }
            });
            return link;
        };

        Grid.prototype.removeNode = function (removeNodeIndex) {
            var _this = this;
            var removeNode = this.nodes_[removeNodeIndex];
            var removedLinks;
            var previousLinks;
            this.execute({
                execute: function () {
                    _this.nodes_.splice(removeNodeIndex, 1);
                    previousLinks = _this.links_;
                    _this.links_ = _this.links_.filter(function (link) {
                        return link.source != removeNode && link.target != removeNode;
                    });
                    _this.updateNodeIndex();
                    _this.updateConnections();
                },
                revert: function () {
                    _this.nodes_.splice(removeNodeIndex, 0, removeNode);
                    _this.links_ = previousLinks;
                    _this.updateNodeIndex();
                    _this.updateConnections();
                }
            });
        };

        Grid.prototype.removeLink = function (removeLinkIndex) {
            var _this = this;
            var removeLink = this.links_[removeLinkIndex];
            this.execute({
                execute: function () {
                    _this.links_.splice(removeLinkIndex, 1);
                    _this.updateLinkIndex();
                    _this.updateConnections();
                },
                revert: function () {
                    _this.links_.splice(removeLinkIndex, 0, removeLink);
                    _this.updateLinkIndex();
                    _this.updateConnections();
                }
            });
        };

        Grid.prototype.updateNodeText = function (nodeIndex, newText) {
            var node = this.nodes_[nodeIndex];
            var oldText = node.text;
            this.execute({
                execute: function () {
                    node.text = newText;
                },
                revert: function () {
                    node.text = oldText;
                }
            });
        };

        Grid.prototype.updateNodeWeight = function (nodeIndex, newWeight) {
            var node = this.nodes_[nodeIndex];
            var oldWeight = node.weight;
            this.execute({
                execute: function () {
                    node.weight = newWeight;
                },
                revert: function () {
                    node.weight = oldWeight;
                }
            });
        };

        Grid.prototype.updateNodeParticipants = function (nodeIndex, newParticipants) {
            var node = this.nodes_[nodeIndex];
            var oldParticipants = node.participants;
            this.execute({
                execute: function () {
                    node.participants = newParticipants;
                },
                revert: function () {
                    node.participants = oldParticipants;
                }
            });
        };

        Grid.prototype.updateLinkWeight = function (linkIndex, newWeight) {
            var link = this.links_[linkIndex];
            var oldWeight = link.weight;
            this.execute({
                execute: function () {
                    link.weight = newWeight;
                },
                revert: function () {
                    link.weight = oldWeight;
                }
            });
        };

        Grid.prototype.incrementLinkWeight = function (linkIndex) {
            this.updateLinkWeight(linkIndex, this.links_[linkIndex].weight + 1);
        };

        Grid.prototype.decrementLinkWeight = function (linkIndex) {
            this.updateLinkWeight(linkIndex, this.links_[linkIndex].weight - 1);
        };

        Grid.prototype.mergeNode = function (fromIndex, toIndex) {
            var _this = this;
            var fromNode = this.nodes_[fromIndex];
            var toNode = this.nodes_[toIndex];
            var newLinks = this.links_.filter(function (link) {
                return (link.source == fromNode && !_this.hasPath(toNode.index, link.target.index)) || (link.target == fromNode && !_this.hasPath(link.source.index, toNode.index));
            }).map(function (link) {
                if (link.source == fromNode) {
                    return new Link(toNode, link.target);
                } else {
                    return new Link(link.source, toNode);
                }
            });
            this.transactionWith(function () {
                _this.updateNodeText(toIndex, toNode.text + ", " + fromNode.text);
                _this.updateNodeWeight(toIndex, toNode.weight + fromNode.weight);
                _this.updateNodeParticipants(toIndex, toNode.participants.concat(fromNode.participants));
                _this.removeNode(fromIndex);
                _this.execute({
                    execute: function () {
                        newLinks.forEach(function (link) {
                            _this.links_.push(link);
                        });
                        _this.updateConnections();
                    },
                    revert: function () {
                        for (var i = 0; i < newLinks.length; ++i) {
                            _this.links_.pop();
                        }
                        _this.updateConnections();
                    }
                });
            });
        };

        Grid.prototype.radderUpAppend = function (fromIndex, newNode) {
            var _this = this;
            this.transactionWith(function () {
                _this.appendNode(newNode);
                _this.radderUp(fromIndex, newNode.index);
            });
        };

        Grid.prototype.radderUp = function (fromIndex, toIndex) {
            return this.appendLink(toIndex, fromIndex);
        };

        Grid.prototype.radderDownAppend = function (fromIndex, newNode) {
            var _this = this;
            this.transactionWith(function () {
                _this.appendNode(newNode);
                _this.radderDown(fromIndex, newNode.index);
            });
        };

        Grid.prototype.radderDown = function (fromIndex, toIndex) {
            return this.appendLink(fromIndex, toIndex);
        };

        Grid.prototype.canUndo = function () {
            return this.undoStack.length > 0;
        };

        Grid.prototype.undo = function () {
            var commands = this.undoStack.pop();
            commands.revert();
            this.redoStack.push(commands);
        };

        Grid.prototype.canRedo = function () {
            return this.redoStack.length > 0;
        };

        Grid.prototype.redo = function () {
            var commands = this.redoStack.pop();
            commands.execute();
            this.undoStack.push(commands);
        };

        Grid.prototype.toJSON = function () {
            return {
                nodes: this.nodes_.map(function (node) {
                    return {
                        text: node.text,
                        weight: node.weight,
                        original: node.original
                    };
                }),
                links: this.links_.map(function (link) {
                    return {
                        source: link.source.index,
                        target: link.target.index,
                        weight: link.weight
                    };
                })
            };
        };

        Grid.prototype.nodes = function (arg) {
            if (arg === undefined) {
                return this.nodes_;
            }
            this.nodes_ = arg;
            this.updateNodeIndex();
            this.updateConnections();
            return this;
        };

        Grid.prototype.activeNodes = function () {
            var _this = this;
            return this.nodes().filter(function (node) {
                return (!_this.checkActive_ || node.active) && node.weight >= _this.minimumWeight_ && node.visible;
            });
        };

        Grid.prototype.findNode = function (text) {
            var result = null;
            this.nodes_.forEach(function (node) {
                if (node.text == text) {
                    result = node;
                }
            });
            return result;
        };

        Grid.prototype.links = function (arg) {
            if (arg === undefined) {
                return this.links_;
            }
            this.links_ = arg;
            this.updateLinkIndex();
            this.updateConnections();
            return this;
        };

        Grid.prototype.activeLinks = function () {
            var _this = this;
            var removeNodes = this.nodes().filter(function (node) {
                return node.weight < _this.minimumWeight_ || !node.visible;
            });
            var newPathMatrix = this.linkMatrix.map(function (row) {
                return row.map(function (v) {
                    return v;
                });
            });
            removeNodes.forEach(function (node) {
                var i, j, k = node.index, n = _this.nodes_.length;
                for (i = 0; i < n; ++i) {
                    for (j = 0; j < n; ++j) {
                        if (newPathMatrix[i][k] && newPathMatrix[k][j]) {
                            newPathMatrix[i][j] = true;
                        }
                    }
                }
            });
            return this.paths.filter(function (link) {
                return newPathMatrix[link.source.index][link.target.index] && (!_this.checkActive_ || link.source.active) && link.source.weight >= _this.minimumWeight_ && link.source.visible && (!_this.checkActive_ || link.target.active) && link.target.weight >= _this.minimumWeight_ && link.target.visible;
            });
        };

        Grid.prototype.link = function (index1, index2) {
            if (typeof index2 === "undefined") { index2 = undefined; }
            if (index2 === undefined) {
                return this.links_[index1];
            } else {
                return this.links_.reduce(function (p, link) {
                    if (link.source.index == index1 && link.target.index == index2) {
                        return link;
                    } else {
                        return p;
                    }
                }, undefined);
            }
        };

        Grid.prototype.layout = function (options) {
            var lineUpTop = options.lineUpTop === undefined ? true : options.lineUpTop;
            var lineUpBottom = options.lineUpBottom === undefined ? true : options.lineUpBottom;
            var rankDirection = options.rankDirection === undefined || options.rankDirection == 0 /* LR */ ? 'LR' : 'TB';

            var nodes = this.activeNodes();
            var links = this.activeLinks();

            dagre.layout().nodes(nodes).edges(links).lineUpTop(lineUpTop).lineUpBottom(lineUpBottom).rankDir(rankDirection).rankSep(200).edgeSep(20).run();

            nodes.forEach(function (node) {
                node.x = node.dagre.x;
                node.y = node.dagre.y;
                node.width = node.dagre.width;
                node.height = node.dagre.height;
            });

            links.forEach(function (link) {
                link.previousPoints = link.points;
                link.points = link.dagre.points.map(function (p) {
                    return p;
                });
                link.points.unshift(link.source.center());
                link.points.push(link.target.center());
            });
        };

        Grid.prototype.hasPath = function (fromIndex, toIndex) {
            return this.pathMatrix[fromIndex][toIndex];
        };

        Grid.prototype.hasLink = function (fromIndex, toIndex) {
            return this.linkMatrix[fromIndex][toIndex];
        };

        Grid.prototype.numConnectedNodes = function (index) {
            var _this = this;
            var result = 0;
            this.activeNodes().forEach(function (node) {
                if (_this.pathMatrix[index][node.index] || _this.pathMatrix[node.index][index]) {
                    result += 1;
                }
            });
            return result;
        };

        Grid.prototype.checkActive = function (arg) {
            if (arg === undefined) {
                return this.checkActive_;
            } else {
                this.checkActive_ = arg;
                return this;
            }
        };

        Grid.prototype.minimumWeight = function (arg) {
            if (arg === undefined) {
                return this.minimumWeight_;
            } else {
                this.minimumWeight_ = arg;
                return this;
            }
        };

        Grid.prototype.execute = function (command) {
            var _this = this;
            if (this.transaction) {
                command.execute();
                this.transaction.push(command);
            } else {
                this.transactionWith(function () {
                    _this.execute(command);
                });
            }
        };

        Grid.prototype.transactionWith = function (f) {
            this.beginTransaction();
            f();
            this.commitTransaction();
        };

        Grid.prototype.beginTransaction = function () {
            this.transaction = new CommandTransaction();
        };

        Grid.prototype.commitTransaction = function () {
            this.undoStack.push(this.transaction);
            this.redoStack = [];
            this.transaction = undefined;
        };

        Grid.prototype.rollbackTransaction = function () {
            this.transaction.revert();
            this.transaction = undefined;
        };

        Grid.prototype.updateConnections = function () {
            var _this = this;
            this.linkMatrix = this.nodes_.map(function (_) {
                return _this.nodes_.map(function (_) {
                    return false;
                });
            });
            this.links_.forEach(function (link) {
                _this.linkMatrix[link.source.index][link.target.index] = true;
            });

            this.nodes_.forEach(function (node, index1) {
                node.isTop = _this.nodes_.every(function (_, index2) {
                    return !_this.linkMatrix[index2][index1];
                });
                node.isBottom = _this.nodes_.every(function (_, index2) {
                    return !_this.linkMatrix[index1][index2];
                });
            });

            this.pathMatrix = this.nodes_.map(function (_, fromIndex) {
                return _this.nodes_.map(function (_, toIndex) {
                    return fromIndex == toIndex || _this.linkMatrix[fromIndex][toIndex];
                });
            });
            var i, j, k, n = this.nodes_.length;
            for (k = 0; k < n; ++k) {
                for (i = 0; i < n; ++i) {
                    for (j = 0; j < n; ++j) {
                        if (this.pathMatrix[i][k] && this.pathMatrix[k][j]) {
                            this.pathMatrix[i][j] = true;
                        }
                    }
                }
            }

            this.paths = this.links_.map(function (link) {
                return link;
            });
            for (i = 0; i < n; ++i) {
                for (j = 0; j < n; ++j) {
                    if (this.pathMatrix[i][j] && !this.linkMatrix[i][j]) {
                        this.paths.push(new Link(this.nodes_[i], this.nodes_[j]));
                    }
                }
            }
        };

        Grid.prototype.updateNodeIndex = function () {
            this.nodes_.forEach(function (node, i) {
                node.index = i;
            });
        };

        Grid.prototype.updateLinkIndex = function () {
            this.links_.forEach(function (link, i) {
                link.index = i;
            });
        };

        Grid.prototype.updateIndex = function () {
            this.updateNodeIndex();
            this.updateLinkIndex();
        };
        return Grid;
    })();
    egrid.Grid = Grid;
})(egrid || (egrid = {}));
var egrid;
(function (egrid) {
    var DAG = (function () {
        function DAG() {
            this.grid_ = new egrid.Grid;
        }
        DAG.prototype.grid = function () {
            return this.grid_;
        };

        DAG.prototype.nodes = function (arg) {
            if (arg === undefined) {
                return this.grid_.activeNodes();
            }
            this.grid_.nodes(arg);
            return this;
        };

        DAG.prototype.links = function (arg) {
            if (arg === undefined) {
                return this.grid_.activeLinks();
            }
            this.grid_.links(arg);
            return this;
        };

        DAG.prototype.notify = function () {
            if (this.uiCallback) {
                this.uiCallback();
            }
            return this;
        };

        DAG.prototype.registerUiCallback = function (callback) {
            this.uiCallback = callback;
            return this;
        };

        DAG.prototype.undo = function () {
            if (this.grid().canUndo()) {
                this.grid().undo();
                this.draw();
                this.notify();
            }
            return this;
        };

        DAG.prototype.redo = function () {
            if (this.grid().canRedo()) {
                this.grid().redo();
                this.draw();
                this.notify();
            }
            return this;
        };

        DAG.prototype.draw = function () {
            return this;
        };

        DAG.prototype.focusCenter = function () {
            return this;
        };

        DAG.prototype.display = function (regionWidth, regionHeight) {
            if (typeof regionWidth === "undefined") { regionWidth = undefined; }
            if (typeof regionHeight === "undefined") { regionHeight = undefined; }
            return function (selection) {
            };
        };
        return DAG;
    })();
    egrid.DAG = DAG;
})(egrid || (egrid = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var egrid;
(function (egrid) {
    (function (ViewMode) {
        ViewMode[ViewMode["Normal"] = 0] = "Normal";
        ViewMode[ViewMode["Edge"] = 1] = "Edge";
        ViewMode[ViewMode["EdgeAndOriginal"] = 2] = "EdgeAndOriginal";
    })(egrid.ViewMode || (egrid.ViewMode = {}));
    var ViewMode = egrid.ViewMode;

    (function (InactiveNode) {
        InactiveNode[InactiveNode["Hidden"] = 0] = "Hidden";
        InactiveNode[InactiveNode["Transparent"] = 1] = "Transparent";
    })(egrid.InactiveNode || (egrid.InactiveNode = {}));
    var InactiveNode = egrid.InactiveNode;

    (function (ScaleType) {
        ScaleType[ScaleType["Connection"] = 0] = "Connection";
        ScaleType[ScaleType["None"] = 1] = "None";
        ScaleType[ScaleType["Weight"] = 2] = "Weight";
    })(egrid.ScaleType || (egrid.ScaleType = {}));
    var ScaleType = egrid.ScaleType;

    var EgmOption = (function () {
        function EgmOption() {
            this.viewMode = 0 /* Normal */;
            this.inactiveNode = 1 /* Transparent */;
            this.maxScale = 3;
            this.scaleType = 2 /* Weight */;
            this.lineUpTop = true;
            this.lineUpBottom = true;
            this.showGuide = false;
            this.rankDirection = 0 /* LR */;
            this.minimumWeight = 1;
        }
        return EgmOption;
    })();
    egrid.EgmOption = EgmOption;

    (function (Raddering) {
        Raddering[Raddering["RadderUp"] = 0] = "RadderUp";
        Raddering[Raddering["RadderDown"] = 1] = "RadderDown";
    })(egrid.Raddering || (egrid.Raddering = {}));
    var Raddering = egrid.Raddering;

    var EGM = (function (_super) {
        __extends(EGM, _super);
        function EGM() {
            _super.call(this);
            this.removeLinkButtonEnabled = false;
            this.options_ = new EgmOption;
        }
        EGM.prototype.options = function (arg) {
            if (arg === undefined) {
                return this.options_;
            }
            this.options_ = arg;
            return this;
        };

        EGM.prototype.exportSVG = function (c) {
            var left = d3.min(this.nodes(), function (node) {
                return node.left().x;
            });
            var right = d3.max(this.nodes(), function (node) {
                return node.right().x;
            });
            var top = d3.min(this.nodes(), function (node) {
                return node.top().y;
            });
            var bottom = d3.max(this.nodes(), function (node) {
                return node.bottom().y;
            });
            var clonedSvg = this.rootSelection.node().cloneNode(true);
            var selection = d3.select(clonedSvg);
            selection.attr({
                id: null,
                style: null,
                width: null,
                height: null,
                viewBox: '0 0 ' + (right - left) + ' ' + (bottom - top)
            });
            selection.select('.contents').attr('transform', null);
            selection.select('.measure').remove();
            selection.select('.background').remove();
            selection.select('.guide').remove();
            selection.selectAll('.removeLinkButton').remove();
            selection.selectAll('.selected').classed('selected', false);
            selection.selectAll('.connected').classed('connected', false);

            var div = document.createElement('div');
            div.appendChild(clonedSvg);
            c(div.innerHTML);

            return this;
        };

        EGM.prototype.draw = function () {
            var _this = this;
            var spline = d3.svg.line().x(function (d) {
                return d.x;
            }).y(function (d) {
                return d.y;
            }).interpolate("basis");

            this.grid().checkActive(this.options().inactiveNode == 0 /* Hidden */).minimumWeight(this.options().minimumWeight);
            var nodes = this.nodes();
            var links = this.links();

            var nodesSelection = this.contentsSelection.select(".nodes").selectAll(".element").data(nodes, Object);
            nodesSelection.exit().remove();
            nodesSelection.enter().append("g").call(this.appendElement());

            var nodeSizeScale = this.nodeSizeScale();
            nodesSelection.each(function (node) {
                var rect = _this.calcRect(node.text);
                var n = _this.scaleValue(node);
                node.baseWidth = rect.width;
                node.baseHeight = rect.height;
                node.width = node.baseWidth * nodeSizeScale(n);
                node.height = node.baseHeight * nodeSizeScale(n);
            });
            nodesSelection.selectAll("text").text(function (d) {
                return d.text;
            }).attr("x", function (d) {
                return EGM.rx - d.baseWidth / 2;
            }).attr("y", function (d) {
                return EGM.rx;
            });
            nodesSelection.selectAll("rect").attr("x", function (d) {
                return -d.baseWidth / 2;
            }).attr("y", function (d) {
                return -d.baseHeight / 2;
            }).attr("rx", function (d) {
                return (d.original || d.isTop || d.isBottom) ? 0 : EGM.rx;
            }).attr("width", function (d) {
                return d.baseWidth;
            }).attr("height", function (d) {
                return d.baseHeight;
            });

            var linksSelection = this.contentsSelection.select(".links").selectAll(".link").data(links, Object);
            linksSelection.exit().remove();
            linksSelection.enter().append("g").classed("link", true).each(function (link) {
                link.points = [link.source.center(), link.target.center()];
            }).call(function (selection) {
                selection.append("path");
                if (_this.removeLinkButtonEnabled) {
                    selection.call(_this.appendRemoveLinkButton());
                }
            });

            this.grid().layout({
                lineUpTop: this.options_.lineUpTop,
                lineUpBottom: this.options_.lineUpBottom,
                rankDirection: this.options_.rankDirection
            });

            this.rootSelection.selectAll(".contents .links .link path").filter(function (link) {
                return link.previousPoints.length != link.points.length;
            }).attr("d", function (link) {
                if (link.points.length > link.previousPoints.length) {
                    while (link.points.length != link.previousPoints.length) {
                        link.previousPoints.unshift(link.previousPoints[0]);
                    }
                } else {
                    link.previousPoints.splice(1, link.previousPoints.length - link.points.length);
                }
                return spline(link.previousPoints);
            });

            var linkWidthScale = this.linkWidthScale();
            var selectedNode = this.selectedNode();
            var transition = this.rootSelection.transition();
            transition.selectAll(".element").attr("opacity", function (node) {
                return node.active ? 1 : 0.3;
            }).attr("transform", function (node) {
                return (new Svg.Transform.Translate(node.center().x, node.center().y)).toString() + (new Svg.Transform.Rotate(node.theta / Math.PI * 180)).toString() + (new Svg.Transform.Scale(nodeSizeScale(_this.scaleValue(node)))).toString();
            });
            transition.selectAll(".link path").attr("d", function (link) {
                return spline(link.points);
            }).attr("opacity", function (link) {
                return link.source.active && link.target.active ? 1 : 0.3;
            }).attr("stroke-width", function (d) {
                return linkWidthScale(d.weight);
            });
            transition.selectAll(".link .removeLinkButton").attr("transform", function (link) {
                return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
            }).style('visibility', function (link) {
                return link.source == selectedNode || link.target == selectedNode ? 'visible' : 'hidden';
            });
            transition.each("end", function () {
                _this.notify();
            });

            this.rescale();

            this.drawGuide();

            return this;
        };

        EGM.prototype.drawNodeConnection = function () {
            var _this = this;
            var d = this.selectedNode();
            this.rootSelection.selectAll(".connected").classed("connected", false);
            if (d) {
                d3.selectAll(".element").filter(function (d2) {
                    return _this.grid().hasPath(d.index, d2.index) || _this.grid().hasPath(d2.index, d.index);
                }).classed("connected", true);
                d3.selectAll(".link").filter(function (link) {
                    return (_this.grid().hasPath(d.index, link.source.index) && _this.grid().hasPath(d.index, link.target.index)) || (_this.grid().hasPath(link.source.index, d.index) && _this.grid().hasPath(link.target.index, d.index));
                }).classed("connected", true);
                d3.selectAll(".link .removeLinkButton").style('visibility', function (link) {
                    return link.source == d || link.target == d ? 'visible' : 'hidden';
                });
            }
        };

        EGM.prototype.getTextBBox = function (text) {
            return this.rootSelection.select(".measure").text(text).node().getBBox();
        };

        EGM.prototype.calcRect = function (text) {
            var bbox = this.getTextBBox(text);
            return new Svg.Rect(bbox.x, bbox.y, bbox.width + EGM.rx * 2, bbox.height + EGM.rx * 2);
        };

        EGM.prototype.appendElement = function () {
            var _this = this;
            return function (selection) {
                var egm = _this;
                var onElementClick = function () {
                    var selection = d3.select(this);
                    if (selection.classed("selected")) {
                        egm.unselectElement();
                        d3.event.stopPropagation();
                    } else {
                        egm.selectElement(selection);
                        d3.event.stopPropagation();
                    }
                    egm.notify();
                };
                selection.classed("element", true).on("click", onElementClick).on("touchstart", onElementClick);

                selection.append("rect");
                selection.append("text");
            };
        };

        EGM.prototype.appendRemoveLinkButton = function () {
            var _this = this;
            return function (selection) {
                selection.append("g").classed("removeLinkButton", true).attr("transform", function (link) {
                    return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
                }).style('visibility', 'hidden').on("click", function (d) {
                    _this.grid().removeLink(d.index);
                    _this.draw();
                    _this.drawNodeConnection();
                }).call(function (selection) {
                    selection.append("circle").attr("r", 16).attr("fill", "lightgray").attr("stroke", "none");
                    selection.append("image").attr("x", -8).attr("y", -8).attr("width", "16px").attr("height", "16px").attr("xlink:href", "images/glyphicons_207_remove_2.png");
                });
            };
        };

        EGM.prototype.scaleValue = function (node) {
            switch (this.options_.scaleType) {
                case 0 /* Connection */:
                    return this.grid().numConnectedNodes(node.index);
                case 2 /* Weight */:
                    return node.weight;
                case 1 /* None */:
                default:
                    return 1;
            }
        };

        EGM.prototype.nodeSizeScale = function () {
            var _this = this;
            return d3.scale.linear().domain(d3.extent(this.nodes(), function (node) {
                return _this.scaleValue(node);
            })).range([1, this.options_.maxScale]);
        };

        EGM.prototype.linkWidthScale = function () {
            return d3.scale.linear().domain(d3.extent(this.links(), function (link) {
                return link.weight;
            })).range([5, 15]);
        };

        EGM.prototype.rescale = function () {
            var filterdNodes = this.nodes();
            var left = d3.min(filterdNodes, function (node) {
                return node.left().x;
            });
            var right = d3.max(filterdNodes, function (node) {
                return node.right().x;
            });
            var top = d3.min(filterdNodes, function (node) {
                return node.top().y;
            });
            var bottom = d3.max(filterdNodes, function (node) {
                return node.bottom().y;
            });

            var s = d3.min([
                1,
                0.9 * d3.min([
                    this.displayWidth / (right - left),
                    this.displayHeight / (bottom - top)]) || 1
            ]);
            this.contentsZoomBehavior.scaleExtent([s, 1]);
        };

        EGM.prototype.resize = function (width, height) {
            this.displayWidth = width;
            this.displayHeight = height;
            this.rootSelection.attr("viewBox", (new Svg.ViewBox(0, 0, this.displayWidth, this.displayHeight)).toString());
            this.drawGuide();
        };

        EGM.prototype.display = function (regionWidth, regionHeight) {
            var _this = this;
            if (typeof regionWidth === "undefined") { regionWidth = undefined; }
            if (typeof regionHeight === "undefined") { regionHeight = undefined; }
            return function (selection) {
                _this.rootSelection = selection;
                _this.rootSelection.attr({
                    version: "1.1",
                    xmlns: "http://www.w3.org/2000/svg",
                    "xmlns:xmlns:xlink": "http://www.w3.org/1999/xlink"
                });

                _this.displayWidth = regionWidth || $(window).width();
                _this.displayHeight = regionHeight || $(window).height();
                selection.attr("viewBox", (new Svg.ViewBox(0, 0, _this.displayWidth, _this.displayHeight)).toString());
                selection.append('defs').append('style').attr('type', 'text/css').text("\
            .element text, text.measure {\
              font-size: 0.8cm;\
              font-family: 'Lucida Grande', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif;\
            }\
            .element rect {\
              fill: white;\
              stroke: #323a48;\
              stroke-width: 5;\
            }\
            .link {\
              stroke: #323a48;\
              fill: none;\
            }\
          ");
                selection.append("text").classed("measure", true).style("visibility", "hidden");

                selection.append("rect").classed('background', true).attr("fill", "#fff").attr("width", _this.displayWidth).attr("height", _this.displayHeight);

                _this.contentsSelection = selection.append("g").classed("contents", true);
                _this.contentsSelection.append("g").classed("links", true);
                _this.contentsSelection.append("g").classed("nodes", true);
                _this.createGuide(selection);

                _this.contentsZoomBehavior = d3.behavior.zoom().on("zoom", function () {
                    var translate = new Svg.Transform.Translate(d3.event.translate[0], d3.event.translate[1]);
                    var scale = new Svg.Transform.Scale(d3.event.scale);
                    _this.contentsSelection.attr("transform", translate.toString() + scale.toString());

                    _this.notify();
                });
                selection.call(_this.contentsZoomBehavior);
                selection.on('dblclick.zoom', null);
            };
        };

        EGM.prototype.createGuide = function (selection) {
            var guideSelection = selection.append('g').classed('guide', true).style('visibility', 'hidden');
            guideSelection.append('defs').call(function (selection) {
                selection.append('marker').attr({
                    'id': 'arrow-start-marker',
                    'markerUnits': 'strokeWidth',
                    'markerWidth': 3,
                    'markerHeight': 3,
                    'viewBox': '0 0 10 10',
                    'refX': 5,
                    'refY': 5
                }).append('polygon').attr({
                    'points': '10,0 5,5 10,10 0,5',
                    'fill': 'black'
                });
                selection.append('marker').attr({
                    'id': 'arrow-end-marker',
                    'markerUnits': 'strokeWidth',
                    'markerWidth': 3,
                    'markerHeight': 3,
                    'viewBox': '0 0 10 10',
                    'refX': 5,
                    'refY': 5
                }).append('polygon').attr({
                    'points': '0,0 5,5 0,10 10,5',
                    'fill': 'black'
                });
            });

            guideSelection.append('rect').classed('guide-rect', true).attr({
                'opacity': 0.9,
                'fill': 'lightgray'
            });
            guideSelection.append('path').classed('guide-axis', true).attr({
                'stroke': 'black',
                'stroke-width': 5,
                'marker-start': 'url(#arrow-start-marker)',
                'marker-end': 'url(#arrow-end-marker)'
            });
            guideSelection.append('text').classed('guide-upper-label', true).text('上位項目').attr({
                'y': 25,
                'text-anchor': 'start',
                'font-size': '1.5em'
            });
            guideSelection.append('text').classed('guide-lower-label', true).text('下位項目').attr({
                'y': 25,
                'text-anchor': 'end',
                'font-size': '1.5em'
            });
            var upperElementTexts = [
                '○○だと、なぜいいのですか？',
                '○○が重要な理由は？',
                '○○だとどのように感じますか？',
                '○○であることには、どんないい点があるのですか？'
            ];
            guideSelection.append('g').selectAll('text.guide-upper-question').data(upperElementTexts).enter().append('text').classed('guide-upper-question', true).text(function (d) {
                return d;
            }).attr({
                'y': function (_, i) {
                    return 20 * i + 60;
                },
                'text-anchor': 'start'
            });
            var lowerElementTexts = [
                '○○のどこがいいのですか？',
                'どういった点で○○が重要なのですか？',
                '○○であるためには、具体的に何がどうなっていることが必要だと思いますか？'
            ];
            guideSelection.append('g').selectAll('text.guide-lower-question').data(lowerElementTexts).enter().append('text').classed('guide-lower-question', true).text(function (d) {
                return d;
            }).attr({
                'y': function (_, i) {
                    return 20 * i + 60;
                },
                'text-anchor': 'end'
            });
        };

        EGM.prototype.drawGuide = function () {
            var guideHeight = 130;
            var line = d3.svg.line();
            var axisFrom = [this.displayWidth * 0.1, 35];
            var axisTo = [this.displayWidth * 0.9, 35];
            var guideSelection = this.rootSelection.select('.guide').attr('transform', 'translate(0, ' + (this.displayHeight - guideHeight) + ')').style('visibility', this.options_.showGuide ? 'visible' : 'hidden');
            guideSelection.select('.guide-rect').attr({
                'width': this.displayWidth,
                'height': guideHeight
            });
            guideSelection.select('.guide-axis').attr('d', line([axisFrom, axisTo]));
            guideSelection.select('.guide-upper-label').attr('x', axisFrom[0]);
            guideSelection.select('.guide-lower-label').attr('x', axisTo[0]);
            guideSelection.selectAll('.guide-upper-question').attr('x', axisFrom[0]);
            guideSelection.selectAll('.guide-lower-question').attr('x', axisTo[0]);
        };

        EGM.prototype.createNode = function (text) {
            var node = new egrid.Node(text);
            return node;
        };

        EGM.prototype.focusNode = function (node) {
            var s = this.contentsZoomBehavior.scale() || 1;
            var translate = new Svg.Transform.Translate(this.displayWidth / 2 - node.center().x * s, this.displayHeight / 2 - node.center().y * s);
            var scale = new Svg.Transform.Scale(s);
            this.contentsZoomBehavior.translate([translate.x, translate.y]);
            this.contentsSelection.transition().attr("transform", translate.toString() + scale.toString());
        };

        EGM.prototype.focusCenter = function (animate) {
            if (typeof animate === "undefined") { animate = true; }
            var left = d3.min(this.nodes(), function (node) {
                return node.left().x;
            });
            var right = d3.max(this.nodes(), function (node) {
                return node.right().x;
            });
            var top = d3.min(this.nodes(), function (node) {
                return node.top().y;
            });
            var bottom = d3.max(this.nodes(), function (node) {
                return node.bottom().y;
            });

            var s = d3.min([
                1, 0.9 * d3.min([
                    this.displayWidth / (right - left),
                    this.displayHeight / (bottom - top)]) || 1]);
            var translate = new Svg.Transform.Translate((this.displayWidth - (right - left) * s) / 2, (this.displayHeight - (bottom - top) * s) / 2);
            var scale = new Svg.Transform.Scale(s);
            this.contentsZoomBehavior.translate([translate.x, translate.y]);
            this.contentsZoomBehavior.scale(scale.sx);
            if (animate) {
                this.contentsSelection.transition().attr("transform", translate.toString() + scale.toString());
            } else {
                this.contentsSelection.attr("transform", translate.toString() + scale.toString());
            }
            return this;
        };

        EGM.prototype.selectElement = function (selection) {
            this.rootSelection.selectAll(".selected").classed("selected", false);
            selection.classed("selected", true);
            this.drawNodeConnection();
        };

        EGM.prototype.selectedNode = function () {
            var selection = this.rootSelection.select(".selected");
            return selection.empty() ? null : selection.datum();
        };

        EGM.prototype.unselectElement = function () {
            this.rootSelection.selectAll(".selected").classed("selected", false);
            this.rootSelection.selectAll(".connected").classed("connected", false);
            this.rootSelection.selectAll(".link .removeLinkButton").style('visibility', 'hidden');
        };

        EGM.prototype.dragNode = function () {
            var egm = this;
            var isDroppable_;
            var dragToNode_;
            var dragToOther_;
            var f = function (selection) {
                var from;
                selection.call(d3.behavior.drag().on("dragstart", function () {
                    from = d3.select(".selected");
                    from.classed("dragSource", true);
                    var pos = [from.datum().center().x, from.datum().center().y];
                    egm.rootSelection.select(".contents").append("line").classed("dragLine", true).attr("x1", pos[0]).attr("y1", pos[1]).attr("x2", pos[0]).attr("y2", pos[1]);
                    d3.event.sourceEvent.stopPropagation();
                }).on("drag", function () {
                    var dragLineSelection = egm.rootSelection.select(".dragLine");
                    var x1 = Number(dragLineSelection.attr("x1"));
                    var y1 = Number(dragLineSelection.attr("y1"));
                    var p2 = egm.getPos(egm.rootSelection.select(".contents").node());
                    var x2 = p2.x;
                    var y2 = p2.y;
                    var theta = Math.atan2(y2 - y1, x2 - x1);
                    var r = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)) - 10;
                    dragLineSelection.attr("x2", x1 + r * Math.cos(theta)).attr("y2", y1 + r * Math.sin(theta));
                    var pos = egm.getPos(document.body);
                    var to = d3.select(document.elementFromPoint(pos.x, pos.y).parentNode);
                    var fromNode = from.datum();
                    var toNode = to.datum();
                    if (to.classed("element") && !to.classed("selected")) {
                        if (isDroppable_ && isDroppable_(fromNode, toNode)) {
                            to.classed("droppable", true);
                        } else {
                            to.classed("undroppable", true);
                        }
                    } else {
                        egm.rootSelection.selectAll(".droppable, .undroppable").classed("droppable", false).classed("undroppable", false);
                    }
                }).on("dragend", function () {
                    var pos = egm.getPos(document.body);
                    var to = d3.select(document.elementFromPoint(pos.x, pos.y).parentNode);
                    var fromNode = from.datum();
                    var toNode = to.datum();
                    if (toNode && fromNode != toNode) {
                        if (dragToNode_ && (!isDroppable_ || isDroppable_(fromNode, toNode))) {
                            dragToNode_(fromNode, toNode);
                        }
                    } else {
                        if (dragToOther_) {
                            dragToOther_(fromNode);
                        }
                    }
                    to.classed("droppable", false);
                    to.classed("undroppable", false);
                    from.classed("dragSource", false);
                    egm.rootSelection.selectAll(".dragLine").remove();
                }));
                return this;
            };
            f.isDroppable_ = function (from, to) {
                return true;
            };
            f.isDroppable = function (f) {
                isDroppable_ = f;
                return this;
            };
            f.dragToNode = function (f) {
                dragToNode_ = f;
                return this;
            };
            f.dragToOther = function (f) {
                dragToOther_ = f;
                return this;
            };
            return f;
        };

        EGM.prototype.raddering = function (selection, type) {
            var _this = this;
            var dragToNode = function (fromNode, toNode) {
                switch (type) {
                    case 0 /* RadderUp */:
                        if (_this.grid().hasLink(toNode.index, fromNode.index)) {
                            var link = _this.grid().link(toNode.index, fromNode.index);
                            _this.grid().incrementLinkWeight(link.index);
                            _this.draw();
                        } else {
                            _this.grid().radderUp(fromNode.index, toNode.index);
                            _this.draw();
                            _this.drawNodeConnection();
                            _this.focusNode(toNode);
                        }
                        break;
                    case 1 /* RadderDown */:
                        if (_this.grid().hasLink(fromNode.index, toNode.index)) {
                            var link = _this.grid().link(fromNode.index, toNode.index);
                            _this.grid().incrementLinkWeight(link.index);
                            _this.draw();
                        } else {
                            _this.grid().radderDown(fromNode.index, toNode.index);
                            _this.draw();
                            _this.drawNodeConnection();
                            _this.focusNode(toNode);
                        }
                        break;
                }
                _this.notify();
            };

            selection.call(this.dragNode().isDroppable(function (fromNode, toNode) {
                return !((type == 0 /* RadderUp */ && _this.grid().hasPath(fromNode.index, toNode.index)) || (type == 1 /* RadderDown */ && _this.grid().hasPath(toNode.index, fromNode.index)));
            }).dragToNode(dragToNode).dragToOther(function (fromNode) {
                var openPrompt;
                switch (type) {
                    case 0 /* RadderUp */:
                        openPrompt = _this.openLadderUpPrompt;
                        break;
                    case 1 /* RadderDown */:
                        openPrompt = _this.openLadderDownPrompt;
                        break;
                }

                openPrompt && openPrompt(function (text) {
                    if (text) {
                        var node;
                        if (node = _this.grid().findNode(text)) {
                            dragToNode(fromNode, node);
                        } else {
                            node = _this.createNode(text);
                            switch (type) {
                                case 0 /* RadderUp */:
                                    _this.grid().radderUpAppend(fromNode.index, node);
                                    break;
                                case 1 /* RadderDown */:
                                    _this.grid().radderDownAppend(fromNode.index, node);
                                    break;
                            }
                            _this.draw();
                            _this.drawNodeConnection();
                            _this.focusNode(node);
                            _this.notify();
                        }
                    }
                });
            }));
        };

        EGM.prototype.getPos = function (container) {
            var xy = d3.event.sourceEvent instanceof MouseEvent ? d3.mouse(container) : d3.touches(container, d3.event.sourceEvent.changedTouches)[0];
            return new Svg.Point(xy[0], xy[1]);
        };

        EGM.prototype.showRemoveLinkButton = function (arg) {
            if (arg === undefined) {
                return this.removeLinkButtonEnabled;
            }
            this.removeLinkButtonEnabled = arg;
            return this;
        };

        EGM.prototype.appendNode = function (text) {
            if (text) {
                var node;
                if (node = this.grid().findNode(text)) {
                } else {
                    node = this.createNode(text);
                    node.original = true;
                    this.grid().appendNode(node);
                    this.draw();
                }
                var addedElement = this.contentsSelection.selectAll(".element").filter(function (node) {
                    return node.text == text;
                });
                this.selectElement(addedElement);
                this.focusNode(addedElement.datum());
                this.notify();
            }
            return this;
        };

        EGM.prototype.removeSelectedNode = function () {
            return this.removeNode(this.selectedNode());
        };

        EGM.prototype.removeNode = function (node) {
            if (node) {
                this.unselectElement();
                this.grid().removeNode(node.index);
                this.draw();
                this.unselectElement();
                this.notify();
            }
            return this;
        };

        EGM.prototype.mergeNode = function (fromNode, toNode) {
            if (fromNode && toNode) {
                this.grid().mergeNode(fromNode.index, toNode.index);
                this.draw();
                this.unselectElement();
                this.focusNode(toNode);
                this.notify();
            }
            return this;
        };

        EGM.prototype.editSelectedNode = function (text) {
            return this.editNode(this.selectedNode(), text);
        };

        EGM.prototype.editNode = function (node, text) {
            if (node && text) {
                this.grid().updateNodeText(node.index, text);
                this.draw();
                this.notify();
            }
            return this;
        };
        EGM.rx = 20;
        return EGM;
    })(egrid.DAG);
    egrid.EGM = EGM;
})(egrid || (egrid = {}));
var egrid;
(function (egrid) {
    var EGMUi = (function () {
        function EGMUi() {
            var _this = this;
            this.egm_ = new egrid.EGM();
            this.egm_.registerUiCallback(function () {
                _this.updateNodeButtons();
                _this.updateUndoButton();
                _this.updateRedoButton();
            });
        }
        EGMUi.prototype.egm = function () {
            return this.egm_;
        };

        EGMUi.prototype.appendNodeButton = function () {
            var egmui = this;
            var onClickPrompt;
            var f = function (selection) {
                selection.on("click", function () {
                    onClickPrompt && onClickPrompt(function (text) {
                        egmui.egm().appendNode(text);
                    });
                });
                return this;
            };
            f.onClick = function (f) {
                onClickPrompt = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.removeNodeButton = function () {
            var egmui = this;
            var f = function (selection) {
                selection.on("click", function () {
                    egmui.egm().removeSelectedNode();
                });
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableRemoveNodeButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableRemoveNodeButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.mergeNodeButton = function () {
            var egmui = this;
            var f = function (selection) {
                selection.call(egmui.egm().dragNode().isDroppable(function (fromNode, toNode) {
                    return !egmui.egm().grid().hasPath(toNode.index, fromNode.index);
                }).dragToNode(function (fromNode, toNode) {
                    egmui.egm().mergeNode(fromNode, toNode);
                }));
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableMergeNodeButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableMergeNodeButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.editNodeButton = function () {
            var egmui = this;
            var onClickPrompt;
            var f = function (selection) {
                selection.on("click", function () {
                    onClickPrompt && onClickPrompt(function (text) {
                        egmui.egm().editSelectedNode(text);
                    });
                });
                return this;
            };
            f.onClick = function (f) {
                onClickPrompt = f;
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableEditNodeButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableEditNodeButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.radderUpButton = function () {
            var egmui = this;
            var f = function (selection) {
                egmui.egm().raddering(selection, 0 /* RadderUp */);
            };
            f.onClick = function (f) {
                egmui.egm().openLadderUpPrompt = f;
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableRadderUpButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableRadderUpButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.radderDownButton = function () {
            var egmui = this;
            var f = function (selection) {
                egmui.egm().raddering(selection, 1 /* RadderDown */);
                return this;
            };
            f.onClick = function (f) {
                egmui.egm().openLadderDownPrompt = f;
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableRadderDownButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableRadderDownButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.saveButton = function () {
            var egmui = this;
            var f = function (selection) {
                selection.on("click", function () {
                    if (egmui.onClickSaveButton) {
                        egmui.onClickSaveButton(egmui.egm().grid().toJSON());
                    }
                });
                return this;
            };
            f.save = function (f) {
                egmui.onClickSaveButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.undoButton = function () {
            var egmui = this;
            var egm = this.egm();
            var f = function (selection) {
                selection.on("click", function () {
                    egm.undo();
                });
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableUndoButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableUndoButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.redoButton = function () {
            var egmui = this;
            var egm = this.egm();
            var f = function (selection) {
                selection.on("click", function () {
                    egm.redo();
                });
                return this;
            };
            f.onEnable = function (f) {
                egmui.onEnableRedoButton = f;
                return this;
            };
            f.onDisable = function (f) {
                egmui.onDisableRedoButton = f;
                return this;
            };
            return f;
        };

        EGMUi.prototype.updateNodeButtons = function () {
            var egm = this.egm();
            var selectedNode = egm.selectedNode();
            if (selectedNode) {
                this.enableNodeButtons();
            } else {
                this.disableNodeButtons();
            }
        };

        EGMUi.prototype.enableNodeButtons = function () {
            var selection = d3.select(".selected");
            this.enableRemoveNodeButton(selection);
            this.enableMergeNodeButton(selection);
            this.enableEditNodeButton(selection);
            this.enableRadderUpButton(selection);
            this.enableRadderDownButton(selection);
        };

        EGMUi.prototype.disableNodeButtons = function () {
            this.disableRemoveNodeButton();
            this.disableMergeNodeButton();
            this.disableEditNodeButton();
            this.disableRadderUpButton();
            this.disableRadderDownButton();
        };

        EGMUi.prototype.enableRadderUpButton = function (selection) {
            if (this.onEnableRadderUpButton) {
                this.onEnableRadderUpButton(selection);
            }
        };

        EGMUi.prototype.disableRadderUpButton = function () {
            if (this.onDisableRadderUpButton) {
                this.onDisableRadderUpButton();
            }
        };

        EGMUi.prototype.enableRadderDownButton = function (selection) {
            if (this.onEnableRadderDownButton) {
                this.onEnableRadderDownButton(selection);
            }
        };

        EGMUi.prototype.disableRadderDownButton = function () {
            if (this.onDisableRadderDownButton) {
                this.onDisableRadderDownButton();
            }
        };

        EGMUi.prototype.enableRemoveNodeButton = function (selection) {
            if (this.onEnableRemoveNodeButton) {
                this.onEnableRemoveNodeButton(selection);
            }
        };

        EGMUi.prototype.disableRemoveNodeButton = function () {
            if (this.onDisableRemoveNodeButton) {
                this.onDisableRemoveNodeButton();
            }
        };

        EGMUi.prototype.enableMergeNodeButton = function (selection) {
            if (this.onEnableMergeNodeButton) {
                this.onEnableMergeNodeButton(selection);
            }
        };

        EGMUi.prototype.disableMergeNodeButton = function () {
            if (this.onDisableMergeNodeButton) {
                this.onDisableMergeNodeButton();
            }
        };

        EGMUi.prototype.enableEditNodeButton = function (selection) {
            if (this.onEnableEditNodeButton) {
                this.onEnableEditNodeButton(selection);
            }
        };

        EGMUi.prototype.disableEditNodeButton = function () {
            if (this.onDisableEditNodeButton) {
                this.onDisableEditNodeButton();
            }
        };

        EGMUi.prototype.enableUndoButton = function () {
            if (this.onEnableUndoButton) {
                this.onEnableUndoButton();
            }
        };

        EGMUi.prototype.disableUndoButton = function () {
            if (this.onDisableUndoButton) {
                this.onDisableUndoButton();
            }
        };

        EGMUi.prototype.enableRedoButton = function () {
            if (this.onEnableRedoButton) {
                this.onEnableRedoButton();
            }
        };

        EGMUi.prototype.disableRedoButton = function () {
            if (this.onDisableRedoButton) {
                this.onDisableRedoButton();
            }
        };

        EGMUi.prototype.updateUndoButton = function () {
            if (this.egm().grid().canUndo()) {
                this.enableUndoButton();
            } else {
                this.disableUndoButton();
            }
        };

        EGMUi.prototype.updateRedoButton = function () {
            if (this.egm().grid().canRedo()) {
                this.enableRedoButton();
            } else {
                this.disableRedoButton();
            }
        };
        return EGMUi;
    })();
    egrid.EGMUi = EGMUi;

    function egmui() {
        return new EGMUi;
    }
    egrid.egmui = egmui;
})(egrid || (egrid = {}));
var egrid;
(function (egrid) {
    var SEM = (function (_super) {
        __extends(SEM, _super);
        function SEM() {
            _super.apply(this, arguments);
            this.removeLinkButtonEnabled = true;
        }
        SEM.prototype.draw = function () {
            var _this = this;
            var spline = d3.svg.line().x(function (d) {
                return d.x;
            }).y(function (d) {
                return d.y;
            }).interpolate("basis");

            var nodes = this.activeNodes();
            var links = this.activeLinks();

            var nodesSelection = this.contentsSelection.select(".nodes").selectAll(".element").data(nodes, Object);
            nodesSelection.exit().remove();
            nodesSelection.enter().append("g").call(this.appendElement());

            var nodeSizeScale = this.nodeSizeScale();
            nodesSelection.each(function (node) {
                var rect = _this.calcRect(node.text);
                var n = _this.grid().numConnectedNodes(node.index);
                node.baseWidth = rect.width;
                node.baseHeight = rect.height;
                node.width = node.baseWidth * nodeSizeScale(n);
                node.height = node.baseHeight * nodeSizeScale(n);
            });
            nodesSelection.selectAll("text").text(function (d) {
                return d.text;
            }).attr("x", function (d) {
                return SEM.rx - d.baseWidth / 2;
            }).attr("y", function (d) {
                return SEM.rx;
            });
            nodesSelection.selectAll("rect").attr("x", function (d) {
                return -d.baseWidth / 2;
            }).attr("y", function (d) {
                return -d.baseHeight / 2;
            }).attr("rx", function (d) {
                return (d.original || d.isTop || d.isBottom) ? 0 : SEM.rx;
            }).attr("width", function (d) {
                return d.baseWidth;
            }).attr("height", function (d) {
                return d.baseHeight;
            });
            nodesSelection.selectAll(".removeNodeButton").attr("transform", function (d) {
                return "translate(" + (-d.baseWidth / 2) + "," + (-d.baseHeight / 2) + ")";
            });

            var linksSelection = this.contentsSelection.select(".links").selectAll(".link").data(links, Object);
            linksSelection.exit().remove();
            linksSelection.enter().append("g").classed("link", true).each(function (link) {
                link.points = [link.source.right(), link.target.left()];
            }).call(function (selection) {
                selection.append("path");
                if (_this.removeLinkButtonEnabled) {
                    selection.call(_this.appendRemoveLinkButton());
                }
                selection.append("text").style("font-size", "2em").attr("stroke", "gray").attr("fill", "gray").attr("x", 20).attr("y", 30);
            });

            this.grid().layout({
                checkActive: true
            });

            this.rootSelection.selectAll(".contents .links .link path").filter(function (link) {
                return link.previousPoints.length != link.points.length;
            }).attr("d", function (link) {
                if (link.points.length > link.previousPoints.length) {
                    while (link.points.length != link.previousPoints.length) {
                        link.previousPoints.unshift(link.previousPoints[0]);
                    }
                } else {
                    link.previousPoints.splice(1, link.previousPoints.length - link.points.length);
                }
                return spline(link.previousPoints);
            });

            var linkWidthScale = this.linkWidthScale();
            var transition = this.rootSelection.transition();
            transition.selectAll(".element").attr("opacity", function (node) {
                return node.active ? 1 : 0.3;
            }).attr("transform", function (node) {
                return (new Svg.Transform.Translate(node.center().x, node.center().y)).toString() + (new Svg.Transform.Rotate(node.theta / Math.PI * 180)).toString() + (new Svg.Transform.Scale(nodeSizeScale(_this.grid().numConnectedNodes(node.index)))).toString();
            });
            transition.selectAll(".link path").attr("d", function (link) {
                return spline(link.points);
            }).attr("opacity", function (link) {
                return link.source.active && link.target.active ? 1 : 0.3;
            }).attr("stroke-width", function (d) {
                return linkWidthScale(Math.abs(d.coef));
            }).attr("stroke", function (d) {
                return d.coef >= 0 ? "blue" : "red";
            });
            var coefFormat = d3.format(".3f");
            transition.selectAll(".link text").attr("transform", function (link) {
                return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
            }).text(function (d) {
                return coefFormat(d.coef);
            });
            transition.selectAll(".link .removeLinkButton").attr("transform", function (link) {
                return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
            });
            transition.each("end", function () {
            });

            this.rescale();

            return this;
        };

        SEM.prototype.getTextBBox = function (text) {
            return this.rootSelection.select(".measure").text(text).node().getBBox();
        };

        SEM.prototype.calcRect = function (text) {
            var bbox = this.getTextBBox(text);
            return new Svg.Rect(bbox.x, bbox.y, bbox.width + SEM.rx * 2, bbox.height + SEM.rx * 2);
        };

        SEM.prototype.appendElement = function () {
            var _this = this;
            return function (selection) {
                selection.classed("element", true);
                selection.append("rect");
                selection.append("text");
                selection.append("g").classed("removeNodeButton", true).on("click", function (d) {
                    d.active = false;
                    _this.draw();
                    _this.notify();
                }).call(function (selection) {
                    selection.append("circle").attr("r", 16).attr("fill", "lightgray").attr("stroke", "none");
                    selection.append("image").attr("x", -8).attr("y", -8).attr("width", "16px").attr("height", "16px").attr("xlink:href", "images/glyphicons_207_remove_2.png");
                });
                selection.call(_this.dragNode().isDroppable(function (fromNode, toNode) {
                    return fromNode != toNode && !_this.grid().hasPath(fromNode.index, toNode.index);
                }).dragToNode(function (fromNode, toNode) {
                    var link = _this.grid().radderUp(fromNode.index, toNode.index);
                    link.coef = 0;
                    _this.draw();
                    _this.notify();
                }));
            };
        };

        SEM.prototype.appendRemoveLinkButton = function () {
            var _this = this;
            return function (selection) {
                selection.append("g").classed("removeLinkButton", true).attr("transform", function (link) {
                    return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
                }).on("click", function (d) {
                    _this.grid().removeLink(d.index);
                    _this.draw();
                    _this.notify();
                }).call(function (selection) {
                    selection.append("circle").attr("r", 16).attr("fill", "lightgray").attr("stroke", "none");
                    selection.append("image").attr("x", -8).attr("y", -8).attr("width", "16px").attr("height", "16px").attr("xlink:href", "images/glyphicons_207_remove_2.png");
                });
            };
        };

        SEM.prototype.nodeSizeScale = function () {
            var _this = this;
            return d3.scale.linear().domain(d3.extent(this.nodes(), function (node) {
                return _this.grid().numConnectedNodes(node.index);
            })).range([1, 1]);
        };

        SEM.prototype.linkWidthScale = function () {
            return d3.scale.linear().domain([
                0, d3.max(this.activeLinks(), function (link) {
                    return Math.abs(link.coef);
                })]).range([5, 15]);
        };

        SEM.prototype.rescale = function () {
            var filterdNodes = this.nodes().filter(function (node) {
                return node.active;
            });
            var left = d3.min(filterdNodes, function (node) {
                return node.left().x;
            });
            var right = d3.max(filterdNodes, function (node) {
                return node.right().x;
            });
            var top = d3.min(filterdNodes, function (node) {
                return node.top().y;
            });
            var bottom = d3.max(filterdNodes, function (node) {
                return node.bottom().y;
            });

            var s = d3.min([
                1,
                0.9 * d3.min([
                    this.displayWidth / (right - left),
                    this.displayHeight / (bottom - top)]) || 1
            ]);
            this.contentsZoomBehavior.scaleExtent([s, 1]);
        };

        SEM.prototype.display = function (regionWidth, regionHeight) {
            var _this = this;
            if (typeof regionWidth === "undefined") { regionWidth = undefined; }
            if (typeof regionHeight === "undefined") { regionHeight = undefined; }
            return function (selection) {
                _this.rootSelection = selection;

                _this.displayWidth = regionWidth || $(window).width();
                _this.displayHeight = regionHeight || $(window).height();
                selection.attr("viewBox", (new Svg.ViewBox(0, 0, _this.displayWidth, _this.displayHeight)).toString());
                selection.append('defs').append('style').attr('type', 'text/css').text("\
            .element text, text.measure {\
              font-size: 0.8cm;\
              font-family: 'Lucida Grande', 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', Meiryo, メイリオ, sans-serif;\
            }\
            .element rect {\
              fill: white;\
              stroke: #323a48;\
              stroke-width: 5;\
            }\
            .link {\
              stroke: #323a48;\
              fill: none;\
            }\
          ");
                selection.append("text").classed("measure", true);

                selection.append("rect").attr("fill", "#fff").attr("width", _this.displayWidth).attr("height", _this.displayHeight);

                _this.contentsSelection = selection.append("g").classed("contents", true);
                _this.contentsSelection.append("g").classed("links", true);
                _this.contentsSelection.append("g").classed("nodes", true);

                _this.contentsZoomBehavior = d3.behavior.zoom().on("zoom", function () {
                    var translate = new Svg.Transform.Translate(d3.event.translate[0], d3.event.translate[1]);
                    var scale = new Svg.Transform.Scale(d3.event.scale);
                    _this.contentsSelection.attr("transform", translate.toString() + scale.toString());
                });
                selection.call(_this.contentsZoomBehavior);
            };
        };

        SEM.prototype.focusCenter = function () {
            var left = d3.min(this.nodes(), function (node) {
                return node.left().x;
            });
            var right = d3.max(this.nodes(), function (node) {
                return node.right().x;
            });
            var top = d3.min(this.nodes(), function (node) {
                return node.top().y;
            });
            var bottom = d3.max(this.nodes(), function (node) {
                return node.bottom().y;
            });

            var s = d3.min([
                1, 0.9 * d3.min([
                    this.displayWidth / (right - left),
                    this.displayHeight / (bottom - top)]) || 1]);
            var translate = new Svg.Transform.Translate((this.displayWidth - (right - left) * s) / 2, (this.displayHeight - (bottom - top) * s) / 2);
            var scale = new Svg.Transform.Scale(s);
            this.contentsZoomBehavior.translate([translate.x, translate.y]);
            this.contentsZoomBehavior.scale(scale.sx);
            this.contentsSelection.transition().attr("transform", translate.toString() + scale.toString());
            return this;
        };

        SEM.prototype.activeNodes = function () {
            return this.nodes().filter(function (d) {
                return d.active;
            });
        };

        SEM.prototype.activeLinks = function () {
            return this.links().filter(function (d) {
                return d.source.active && d.target.active;
            });
        };

        SEM.prototype.dragNode = function () {
            var egm = this;
            var isDroppable_;
            var dragToNode_;
            var dragToOther_;
            var f = function (selection) {
                var from;
                selection.call(d3.behavior.drag().on("dragstart", function () {
                    from = d3.select(document.elementFromPoint(d3.event.sourceEvent.x, d3.event.sourceEvent.y));
                    from.classed("dragSource", true);
                    var pos = [from.datum().center().x, from.datum().center().y];
                    egm.rootSelection.select(".contents").append("line").classed("dragLine", true).attr("x1", pos[0]).attr("y1", pos[1]).attr("x2", pos[0]).attr("y2", pos[1]);
                    d3.event.sourceEvent.stopPropagation();
                }).on("drag", function () {
                    var dragLineSelection = egm.rootSelection.select(".dragLine");
                    var x1 = Number(dragLineSelection.attr("x1"));
                    var y1 = Number(dragLineSelection.attr("y1"));
                    var p2 = egm.getPos(egm.rootSelection.select(".contents").node());
                    var x2 = p2.x;
                    var y2 = p2.y;
                    var theta = Math.atan2(y2 - y1, x2 - x1);
                    var r = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)) - 10;
                    dragLineSelection.attr("x2", x1 + r * Math.cos(theta)).attr("y2", y1 + r * Math.sin(theta));
                    var to = d3.select(document.elementFromPoint(d3.event.sourceEvent.x, d3.event.sourceEvent.y).parentNode);
                    var fromNode = from.datum();
                    var toNode = to.datum();
                    if (to.classed("element") && !to.classed("selected")) {
                        if (isDroppable_ && isDroppable_(fromNode, toNode)) {
                            to.classed("droppable", true);
                        } else {
                            to.classed("undroppable", true);
                        }
                    } else {
                        egm.rootSelection.selectAll(".droppable, .undroppable").classed("droppable", false).classed("undroppable", false);
                    }
                }).on("dragend", function () {
                    var to = d3.select(document.elementFromPoint(d3.event.sourceEvent.x, d3.event.sourceEvent.y).parentNode);
                    var fromNode = from.datum();
                    var toNode = to.datum();
                    if (toNode && fromNode != toNode) {
                        if (dragToNode_ && (!isDroppable_ || isDroppable_(fromNode, toNode))) {
                            dragToNode_(fromNode, toNode);
                        }
                    } else {
                        if (dragToOther_) {
                            dragToOther_(fromNode);
                        }
                    }
                    to.classed("droppable", false);
                    to.classed("undroppable", false);
                    from.classed("dragSource", false);
                    egm.rootSelection.selectAll(".dragLine").remove();
                }));
                return this;
            };
            f.isDroppable_ = function (from, to) {
                return true;
            };
            f.isDroppable = function (f) {
                isDroppable_ = f;
                return this;
            };
            f.dragToNode = function (f) {
                dragToNode_ = f;
                return this;
            };
            f.dragToOther = function (f) {
                dragToOther_ = f;
                return this;
            };
            return f;
        };

        SEM.prototype.getPos = function (container) {
            var xy = d3.event.sourceEvent instanceof MouseEvent ? d3.mouse(container) : d3.touches(container, d3.event.sourceEvent.changedTouches)[0];
            return new Svg.Point(xy[0], xy[1]);
        };

        SEM.prototype.appendNode = function (text) {
            if (text) {
                var node;
                if (node = this.grid().findNode(text)) {
                } else {
                    node = this.createNode(text);
                    node.original = true;
                    this.grid().appendNode(node);
                    this.draw();
                }
                var addedElement = this.contentsSelection.selectAll(".element").filter(function (node) {
                    return node.text == text;
                });

                this.notify();
            }
            return this;
        };

        SEM.prototype.createNode = function (text) {
            var node = new egrid.Node(text);
            node.factor = true;
            return node;
        };
        SEM.rx = 20;
        return SEM;
    })(egrid.DAG);
    egrid.SEM = SEM;

    function sem() {
        return new SEM;
    }
    egrid.sem = sem;
})(egrid || (egrid = {}));
