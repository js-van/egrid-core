/// <reference path="typings/jquery/jquery.d.ts"/>
/// <reference path="typings/d3/d3.d.ts"/>
/// <reference path="lib/dagre.d.ts"/>
/// <reference path="svg.ts"/>


module egrid {
module Impl {
interface GridNode {
  dagre?: any;
  data: any;
  textWidth?: number;
  textHeight?: number;
  originalWidth?: number;
  originalHeight?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  scale?: number;
}


interface GridLink {
  dagre?: any;
  points?: number[][];
  source: GridNode;
  target: GridNode;
}


interface Grid {
  nodes: GridNode[];
  links: GridLink[];
}


var linkLine = d3.svg.line().interpolate('monotone');
var linkPointsSize = 20;
var svgCss = '\
g.node > rect {\
  fill: lightgray;\
}\
g.link > path {\
  fill: none;\
}\
g.node > rect, g.link > path {\
  stroke: black;\
}\
';


function makeGrid<NodeDataType, LinkDataType>(
    nodes: NodeDataType[],
    links: LinkDataType[],
    nodeKey: (nodeData: NodeDataType) => string,
    nodeVisibility: (nodeData: NodeDataType) => boolean,
    linkLower: (linkData: LinkDataType) => number,
    linkUpper: (linkData: LinkDataType) => number,
    oldNodes: GridNode[]): Grid {
  var oldNodesMap = {}
  oldNodes.forEach((node: GridNode) => {
    oldNodesMap[nodeKey(node.data)] = node;
  });
  var gridNodes = nodes.map((nodeData: NodeDataType) => {
    return oldNodesMap[nodeKey(nodeData)] || {
      data: nodeData,
    };
  });
  var gridLinks = [];
  var adjacencies = nodes.map(() => {
    return {
      upper: d3.set(),
      lower: d3.set(),
    };
  });
  links.forEach(link => {
    adjacencies[linkUpper(link)].lower.add(linkLower(link));
    adjacencies[linkLower(link)].upper.add(linkUpper(link));
  });
  nodes.forEach((node, i) => {
    if (!nodeVisibility(node)) {
      adjacencies[i].upper.forEach(upper => {
        adjacencies[i].lower.forEach(lower => {
          adjacencies[upper].lower.add(lower);
          adjacencies[lower].upper.add(upper);
        });
      });
      adjacencies[i].upper.forEach(upper => {
        adjacencies[upper].lower.remove(i);
      });
      adjacencies[i].lower.forEach(lower => {
        adjacencies[lower].upper.remove(i);
      });
      adjacencies[i].upper = d3.set();
      adjacencies[i].lower = d3.set();
    }
  });
  nodes.forEach((node, i) => {
    adjacencies[i].lower.forEach(j => {
      gridLinks.push({
        source: gridNodes[i],
        target: gridNodes[j],
      });
    });
  });
  return {
    nodes: gridNodes.filter((node: GridNode) => nodeVisibility(node.data)),
    links: gridLinks,
  };
}


function calculateTextSize(nodeText: (nodeData: any) => string) {
  return function(selection) {
    var measure = d3.select('body').append('svg');
    var measureText = measure.append('text');

    selection
      .each((node: GridNode) => {
        measureText.text(nodeText(node.data));
        var bbox = (<any>measureText.node()).getBBox();
        node.textWidth = bbox.width;
        node.textHeight = bbox.height;
      });

    measure.remove();
  };
}


function createNode() {
  return function(selection) {
    selection.append('rect');
    selection
      .append('text')
      .each(function(node: GridNode) {
        node.x = 0;
        node.y = 0;
      })
      .attr({
        'text-anchor': 'middle',
        'dominant-baseline': 'text-before-edge',
      })
      ;
  };
}


function updateNodes(nodeScale, nodeText) {
  var r = 5;
  var strokeWidth = 1;
  return function(selection) {
    selection
      .enter()
      .append('g')
      .classed('node', true)
      .call(createNode())
      ;
    selection
      .exit()
      .remove()
      ;
    selection
      .call(calculateTextSize(nodeText))
      .each((node: GridNode) => {
        node.originalWidth = node.textWidth + 2 * r;
        node.originalHeight = node.textHeight + 2 * r;
        node.scale = nodeScale(node.data);
        node.width = (node.originalWidth + strokeWidth) * node.scale;
        node.height = (node.originalHeight + strokeWidth) * node.scale;
      })
      ;
    selection
      .select('text')
      .text((node: GridNode) => nodeText(node.data))
      .attr('y', (node: GridNode) => -node.textHeight / 2)
      ;
    selection
      .select('rect')
      .attr({
        x: (node: GridNode) => -node.originalWidth / 2,
        y: (node: GridNode) => -node.originalHeight / 2,
        width: (node: GridNode) => node.originalWidth,
        height: (node: GridNode) => node.originalHeight,
        rx: r,
      });

  };
}


function updateLinks() {
  return function(selection) {
    selection
      .enter()
      .append('g')
      .classed('link', true)
      .append('path')
      .attr('d', link => {
        var points = [];
        points.push([link.source.x, link.source.y]);
        for (var i = 1; i < linkPointsSize; ++i) {
          points.push([link.target.x, link.target.y]);
        }
        return linkLine(points);
      })
      ;
    selection
      .exit()
      .remove()
      ;
  };
}


interface UpdateOptions {
  linkLower: (linkData: any) => number;
  linkUpper: (linkData: any) => number;
  nodeKey: (nodeData: any) => string;
  nodeScale: (nodeData: any) => number;
  nodeText: (nodeData: any) => string;
  nodeVisibility: (nodeData: any) => boolean;
}


function update(options: UpdateOptions) {
  return function(selection) {
    selection.each(function(data) {
      var container = d3.select(this);
      if (data) {
        var oldNodes = [];
        if (container.select('g.nodes').empty()) {
          container.append('g').classed('nodes', true);
          container.append('g').classed('links', true);
        } else {
          oldNodes = container.selectAll('g.nodes > g.node').data();
        }
        var grid = makeGrid(
          data.nodes,
          data.links,
          options.nodeKey,
          options.nodeVisibility,
          options.linkLower,
          options.linkUpper,
          oldNodes);
        container
          .select('g.nodes')
          .selectAll('g.node')
          .data(grid.nodes, (node: GridNode) => options.nodeKey(node.data))
          .call(updateNodes(options.nodeScale, options.nodeText))
          ;
        container
          .select('g.links')
          .selectAll('g.link')
          .data(grid.links, (link: GridLink) => {
            return options.nodeKey(link.source.data) + ':' + options.nodeKey(link.target.data);
          })
          .call(updateLinks())
          ;
      } else {
        container.select('g.nodes').remove();
        container.select('g.links').remove();
      }
    });
  };
}


interface LayoutOptions {
  nodeKey: (nodeData: any) => string;
}


function layout(options: LayoutOptions) {
  return function(selection) {
    selection.each(function() {
      var container = d3.select(this);
      var nodes = container.selectAll('g.node').data();
      var links = container.selectAll('g.link').data();
      nodes.sort((node1: GridNode, node2: GridNode) => {
        return d3.ascending(options.nodeKey(node1.data), options.nodeKey(node2.data));
      });
      links.sort((link1: GridLink, link2: GridLink) => {
        var key1 = options.nodeKey(link1.source.data) + options.nodeKey(link1.target.data);
        var key2 = options.nodeKey(link2.source.data) + options.nodeKey(link2.target.data);
        return d3.ascending(key1, key2);
      });
      dagre.layout()
        .nodes(nodes)
        .edges(links)
        .lineUpTop(true)
        .lineUpBottom(true)
        .rankDir('LR')
        .rankSep(200)
        .edgeSep(20)
        .run()
        ;
      nodes.forEach((node: GridNode) => {
        node.x = node.dagre.x;
        node.y = node.dagre.y;
      });
      links.forEach((link: GridLink) => {
        link.points = [];
        link.points.push([link.source.x, link.source.y]);
        link.dagre.points.forEach(obj => {
          link.points.push([obj.x, obj.y]);
        });
        link.points.push([link.target.x, link.target.y]);
        for (var i = 0, n = linkPointsSize - link.points.length; i < n; ++i) {
          link.points.push([link.target.x, link.target.y]);
        }
      });
    })
  };
}


interface TransitionOptions {
  nodeColor: (node: GridNode) => string;
  nodeOpacity: (node: GridNode) => number;
}


function transition(options: TransitionOptions) {
  return function(selection) {
    var nodes = selection.selectAll('g.nodes > g.node').data();
    var links = selection.selectAll('g.links > g.link').data();
    var transition = selection.transition();
    transition
      .selectAll('g.nodes > g.node')
      .attr('transform', (node: GridNode) => {
        return svg.transform.compose(
          svg.transform.translate(node.x, node.y),
          svg.transform.scale(node.scale));
      })
      .style('opacity', node => options.nodeOpacity(node.data))
      ;
    transition
      .selectAll('g.nodes > g.node > rect')
      .style('fill', node => options.nodeColor(node.data))
      ;
    transition
      .selectAll('g.links > g.link')
      .select('path')
      .attr('d', link => {
        return linkLine(link.points);
      })
      ;
  };
}


export function call(selection: D3.Selection, that: EGM) {
  selection
    .call(update({
      linkLower: that.linkLower(),
      linkUpper: that.linkUpper(),
      nodeKey: that.nodeKey(),
      nodeScale: that.nodeScale(),
      nodeText: that.nodeText(),
      nodeVisibility: that.nodeVisibility(),
    }))
    .call(layout({
      nodeKey: that.nodeKey(),
    }))
    .call(transition({
      nodeColor: that.nodeColor(),
      nodeOpacity: that.nodeOpacity(),
    }));
}


export function css(selection: D3.Selection) {
  selection
    .append('defs')
    .append('style')
    .text(svgCss);
}
}

export interface EGM {
  (selection: D3.Selection): EGM;
  css(): (selection: D3.Selection) => void;
  options(options: EGMOptions): EGM;
  enableClickNode(): boolean;
  enableClickNode(val: boolean): EGM;
  linkLower(): (linkData: any) => number;
  linkLower(val: (linkData: any) => number): EGM;
  linkUpper(): (linkData: any) => number;
  linkUpper(val: (linkData: any) => number): EGM;
  nodeColor(): (nodeData: any) => string;
  nodeColor(val: (nodeData: any) => string): EGM;
  nodeKey(): (nodeData: any) => string;
  nodeKey(val: (nodeData: any) => string): EGM;
  nodeOpacity(): (nodeData: any) => number;
  nodeOpacity(val: (nodeData: any) => number): EGM;
  nodeScale(): (nodeData: any) => number;
  nodeScale(val: (nodeData: any) => number): EGM;
  nodeText(): (nodeData: any) => string;
  nodeText(val: (nodeData: any) => string): EGM;
  nodeVisibility(): (nodeData: any) => boolean;
  nodeVisibility(val: (nodeData: any) => boolean): EGM;
}


export interface EGMOptions {
  enableClickNode?: boolean;
  linkLower?: (linkData: any) => number;
  linkUpper?: (linkData: any) => number;
  nodeColor?: (nodeData: any) => string;
  nodeKey?: (nodeData: any) => string;
  nodeOpacity?: (nodeData: any) => number;
  nodeScale?: (nodeData: any) => number;
  nodeText?: (nodeData: any) => string;
  nodeVisibility?: (nodeData: any) => boolean;
}


export function egm(options: EGMOptions = {}): EGM {
  function accessor(key) {
    var val;
    return function(arg?: any): any {
      if (arg === undefined) {
        return val;
      }
      val = arg;
      return this;
    }
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
  ];
  var f: EGM = <any>function EGM(selection: D3.Selection) {
    return Impl.call(selection, f);
  }

  f.css = function() {
    return Impl.css;
  }

  f.options = function(options: EGMOptions) {
    optionAttributes.forEach((attr: string) => {
      this[attr](options[attr]);
    });
    return this;
  };

  optionAttributes.forEach((attr: string) => {
    f[attr] = accessor(attr + '_');
  });

  f.options({
    enableClickNode: true,
    linkLower: (linkData: any) => linkData.lower,
    linkUpper: (linkData: any) => linkData.upper,
    nodeColor: () => '',
    nodeOpacity: () => 1,
    nodeScale: () => 1,
    nodeText: (nodeData: any) => nodeData.text,
    nodeVisibility: () => true,
  });
  return f
    .options(options)
    .nodeKey((nodeData: any) => f.nodeText()(nodeData));
}
}
