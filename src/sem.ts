/// <reference path="typings/jquery/jquery.d.ts"/>
/// <reference path="typings/d3/d3.d.ts"/>
/// <reference path="dag.ts"/>

module egrid {
  interface DragNode {
    (selection : D3.Selection) : DragNode;
    isDroppable(f : (from : Node, to : Node) => boolean) : DragNode;
    dragToNode(f : (from : Node, to : Node) => void) : DragNode;
    dragToOther(f : (from : Node) => void) : DragNode;
  }


  /**
   * @class egrid.SEM
   */
  export class SEM extends DAG {
    private static rx : number = 20;
    private displayWidth : number;
    private displayHeight : number;
    private rootSelection : D3.Selection;
    private contentsSelection : D3.Selection;
    private contentsZoomBehavior : D3.Behavior.Zoom;
    private removeLinkButtonEnabled : boolean = true;


    /**
     * @method draw
     * @return {egrid.SEM}
     */
    draw() : SEM {
      var spline = d3.svg.line()
        .x(d => d.x)
        .y(d => d.y)
        .interpolate("basis")
        ;

      var nodes = this.activeNodes();
      var links = this.activeLinks();

      var nodesSelection = this.contentsSelection
        .select(".nodes")
        .selectAll(".element")
        .data(nodes, Object)
        ;
      nodesSelection
        .exit()
        .remove()
        ;
      nodesSelection
        .enter()
        .append("g")
        .call(this.appendElement())
        ;

      var nodeSizeScale = this.nodeSizeScale();
      nodesSelection.each(node => {
        var rect = this.calcRect(node.text);
        var n = this.grid().numConnectedNodes(node.index);
        node.baseWidth = rect.width;
        node.baseHeight = rect.height;
        node.width = node.baseWidth * nodeSizeScale(n);
        node.height = node.baseHeight * nodeSizeScale(n);
      });
      nodesSelection.selectAll("text")
        .text(d => d.text)
        .attr("x", d => SEM.rx - d.baseWidth / 2)
        .attr("y", d => SEM.rx)
        ;
      nodesSelection.selectAll("rect")
        .attr("x", d => - d.baseWidth / 2)
        .attr("y", d => - d.baseHeight / 2)
        .attr("rx", d => (d.original || d.isTop || d.isBottom) ? 0 : SEM.rx)
        .attr("width", d => d.baseWidth)
        .attr("height", d => d.baseHeight)
        ;
      nodesSelection.selectAll(".removeNodeButton")
        .attr("transform", d => {
          return "translate(" + (- d.baseWidth / 2) + "," + (- d.baseHeight / 2) + ")";
        })

      var linksSelection = this.contentsSelection
        .select(".links")
        .selectAll(".link")
        .data(links, Object)
        ;
      linksSelection
        .exit()
        .remove()
        ;
      linksSelection
        .enter()
        .append("g")
        .classed("link", true)
        .each(link => {
          link.points = [link.source.right(), link.target.left()];
        })
        .call(selection => {
          selection.append("path");
          if (this.removeLinkButtonEnabled) {
            selection.call(this.appendRemoveLinkButton());
          }
          selection.append("text")
            .style("font-size", "2em")
            .attr("stroke", "gray")
            .attr("fill", "gray")
            .attr("x", 20)
            .attr("y", 30)
        })
        ;

      this.grid().layout({
        checkActive: true,
      });

      this.rootSelection.selectAll(".contents .links .link path")
        .filter(link => link.previousPoints.length != link.points.length)
        .attr("d", (link : Link) : string => {
          if (link.points.length > link.previousPoints.length) {
            while (link.points.length != link.previousPoints.length) {
              link.previousPoints.unshift(link.previousPoints[0]);
            }
          } else {
            link.previousPoints.splice(1, link.previousPoints.length - link.points.length);
          }
          return spline(link.previousPoints);
        })
        ;

      var linkWidthScale = this.linkWidthScale();
      var transition = this.rootSelection.transition();
      transition.selectAll(".element")
        .attr("opacity", node => {
          return node.active ? 1 : 0.3;
        })
        .attr("transform", (node : egrid.Node) : string => {
          return (new Svg.Transform.Translate(node.center().x, node.center().y)).toString()
            + (new Svg.Transform.Rotate(node.theta / Math.PI * 180)).toString()
            + (new Svg.Transform.Scale(nodeSizeScale(this.grid().numConnectedNodes(node.index)))).toString();
        })
        ;
      transition.selectAll(".link path")
        .attr("d", (link : egrid.Link) : string => {
          return spline(link.points);
        })
        .attr("opacity", link => {
          return link.source.active && link.target.active ? 1 : 0.3;
        })
        .attr("stroke-width", d => linkWidthScale(Math.abs(d.coef)))
        .attr("stroke", d => d.coef >= 0 ? "blue" : "red")
        ;
      var coefFormat = d3.format(".3f");
      transition.selectAll(".link text")
        .attr("transform", link => {
          return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
        })
        .text(d => coefFormat(d.coef))
        ;
      transition.selectAll(".link .removeLinkButton")
        .attr("transform", link => {
          return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
        })
        ;
      transition.each("end", () => {
        //this.notify();
      });

      this.rescale();

      return this;
    }


    private getTextBBox(text : string) : SVGRect {
      return (<any>this.rootSelection.select(".measure").text(text).node()).getBBox();
    }


    private calcRect(text : string) : Svg.Rect {
      var bbox = this.getTextBBox(text);
      return new Svg.Rect(
          bbox.x,
          bbox.y,
          bbox.width + SEM.rx * 2,
          bbox.height + SEM.rx * 2);
    }


    private appendElement() : (selection : D3.Selection) => void {
      return (selection) => {
        selection
          .classed("element", true)
          ;
        selection
          .append("rect")
          ;
        selection
          .append("text")
          ;
        selection.append("g")
          .classed("removeNodeButton", true)
          .on("click", (d) => {
            d.active = false;
            this.draw();
            this.notify();
          })
          .call(selection => {
            selection.append("circle")
              .attr("r", 16)
              .attr("fill", "lightgray")
              .attr("stroke", "none")
              ;
            selection.append("image")
              .attr("x", -8)
              .attr("y", -8)
              .attr("width", "16px")
              .attr("height", "16px")
              .attr("xlink:href", "images/glyphicons_207_remove_2.png")
              ;
          })
          ;
        selection.call(this.dragNode()
          .isDroppable((fromNode : Node, toNode : Node) : boolean => {
            return fromNode != toNode && !this.grid().hasPath(fromNode.index, toNode.index);
          })
          .dragToNode((fromNode : Node, toNode : Node) : void => {
            var link : any = this.grid().radderUp(fromNode.index, toNode.index);
            link.coef = 0;
            this.draw();
            this.notify();
          }))
          ;
      };
    }


    private appendRemoveLinkButton() : (selection : D3.Selection) => void {
      return (selection) => {
        selection.append("g")
          .classed("removeLinkButton", true)
          .attr("transform", link => {
            return "translate(" + link.points[1].x + "," + link.points[1].y + ")";
          })
          .on("click", (d) => {
            this.grid().removeLink(d.index);
            this.draw();
            this.notify();
          })
          .call(selection => {
            selection.append("circle")
              .attr("r", 16)
              .attr("fill", "lightgray")
              .attr("stroke", "none")
              ;
            selection.append("image")
              .attr("x", -8)
              .attr("y", -8)
              .attr("width", "16px")
              .attr("height", "16px")
              .attr("xlink:href", "images/glyphicons_207_remove_2.png")
              ;
          })
          ;
      };
    }


    private nodeSizeScale() : D3.Scale.Scale {
      return d3.scale
        .linear()
        .domain(d3.extent(this.nodes(), node => {
          return this.grid().numConnectedNodes(node.index);
        }))
        .range([1, 1])
        ;
    }


    private linkWidthScale() : D3.Scale.Scale {
      return d3.scale
        .linear()
        .domain([0, d3.max(this.activeLinks(), (link : any) => {
          return Math.abs(link.coef);
        })])
        .range([5, 15])
        ;
    }


    private rescale() : void {
      var filterdNodes = this.nodes().filter(node => node.active);
      var left = d3.min(filterdNodes, node => {
        return node.left().x;
      });
      var right = d3.max(filterdNodes, node => {
        return node.right().x;
      });
      var top = d3.min(filterdNodes, node => {
        return node.top().y;
      });
      var bottom = d3.max(filterdNodes, node => {
        return node.bottom().y;
      });

      var s = d3.min([
          1,
          0.9 * d3.min([
            this.displayWidth / (right - left),
            this.displayHeight / (bottom - top)]) || 1
      ]);
      this.contentsZoomBehavior
        .scaleExtent([s, 1])
        ;
    }


    /**
     * Generates a function to init display region.
     * @method display
     * @param regionWidth {number} Width of display region.
     * @param regionHeight {number} Height of display region.
     * @return {function}
     */
    display(regionWidth : number = undefined, regionHeight : number = undefined)
        : (selection : D3.Selection) => void {
      return (selection) => {
        this.rootSelection = selection;

        this.displayWidth = regionWidth || $(window).width();
        this.displayHeight = regionHeight || $(window).height();
        selection.attr("viewBox", (new Svg.ViewBox(0, 0, this.displayWidth, this.displayHeight)).toString());
        selection.append('defs')
          .append('style')
          .attr('type', 'text/css')
          .text("\
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
        selection.append("text")
          .classed("measure", true)
          ;

        selection.append("rect")
          .attr("fill", "#fff")
          .attr("width", this.displayWidth)
          .attr("height", this.displayHeight)
          ;

        this.contentsSelection = selection.append("g").classed("contents", true);
        this.contentsSelection.append("g").classed("links", true);
        this.contentsSelection.append("g").classed("nodes", true);

        this.contentsZoomBehavior = d3.behavior.zoom()
          .on("zoom", () => {
              var translate = new Svg.Transform.Translate(
                d3.event.translate[0], d3.event.translate[1]);
              var scale = new Svg.Transform.Scale(d3.event.scale);
              this.contentsSelection.attr("transform", translate.toString() + scale.toString());

              //this.notify();
          })
          ;
        selection.call(this.contentsZoomBehavior);
      };
    }


    /**
     * @method focusCenter
     */
    focusCenter() : SEM {
      var left = d3.min(this.nodes(), node => {
        return node.left().x;
      });
      var right = d3.max(this.nodes(), node => {
        return node.right().x;
      });
      var top = d3.min(this.nodes(), node => {
        return node.top().y;
      });
      var bottom = d3.max(this.nodes(), node => {
        return node.bottom().y;
      });

      var s = d3.min([1, 0.9 * d3.min([
          this.displayWidth / (right - left),
          this.displayHeight / (bottom - top)]) || 1]);
      var translate = new Svg.Transform.Translate(
          (this.displayWidth - (right - left) * s) / 2,
          (this.displayHeight - (bottom - top) * s) / 2
          );
      var scale = new Svg.Transform.Scale(s);
      this.contentsZoomBehavior.translate([translate.x, translate.y]);
      this.contentsZoomBehavior.scale(scale.sx);
      this.contentsSelection
        .transition()
        .attr("transform", translate.toString() + scale.toString());
      return this;
    }


    activeNodes() {
      return this.nodes().filter(d => d.active);
    }


    activeLinks() {
      return this.links().filter(d => d.source.active && d.target.active);
    }


    private dragNode() : DragNode {
      var egm = this;
      var isDroppable_;
      var dragToNode_;
      var dragToOther_;
      var f : any = function(selection : D3.Selection) : DragNode {
        var from;
        selection.call(d3.behavior.drag()
            .on("dragstart", () => {
              from = d3.select(document.elementFromPoint(d3.event.sourceEvent.x, d3.event.sourceEvent.y));
              from.classed("dragSource", true);
              var pos = [from.datum().center().x, from.datum().center().y];
              egm.rootSelection.select(".contents")
                .append("line")
                .classed("dragLine", true)
                .attr("x1", pos[0])
                .attr("y1", pos[1])
                .attr("x2", pos[0])
                .attr("y2", pos[1])
                ;
              (<any>d3.event.sourceEvent).stopPropagation();
            })
            .on("drag", () => {
              var dragLineSelection = egm.rootSelection.select(".dragLine");
              var x1 = Number(dragLineSelection.attr("x1"));
              var y1 = Number(dragLineSelection.attr("y1"));
              var p2 = egm.getPos(egm.rootSelection.select(".contents").node());
              var x2 = p2.x;
              var y2 = p2.y;
              var theta = Math.atan2(y2 - y1, x2 - x1);
              var r = Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1)) - 10;
              dragLineSelection
                .attr("x2", x1 + r * Math.cos(theta))
                .attr("y2", y1 + r * Math.sin(theta))
                ;
              var to = d3.select(document.elementFromPoint(d3.event.sourceEvent.x, d3.event.sourceEvent.y).parentNode);
              var fromNode : Node = from.datum();
              var toNode : Node = to.datum();
              if (to.classed("element") && !to.classed("selected")) {
                if (isDroppable_ && isDroppable_(fromNode, toNode)) {
                  to.classed("droppable", true);
                } else {
                  to.classed("undroppable", true);
                }
              } else {
                egm.rootSelection.selectAll(".droppable, .undroppable")
                  .classed("droppable", false)
                  .classed("undroppable", false)
                  ;
              }
            })
            .on("dragend", () => {
              var to = d3.select(document.elementFromPoint(d3.event.sourceEvent.x, d3.event.sourceEvent.y).parentNode);
              var fromNode : Node = from.datum();
              var toNode : Node = to.datum();
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
            }))
            ;
        return this;
      }
      f.isDroppable_ = (from : Node, to : Node) : boolean => true;
      f.isDroppable = function(f : (from : Node, to : Node) => boolean) : DragNode {
        isDroppable_ = f;
        return this;
      }
      f.dragToNode = function(f : (from : Node, to : Node) => void) : DragNode {
        dragToNode_ = f;
        return this;
      }
      f.dragToOther = function(f : (from : Node) => void) : DragNode {
        dragToOther_ = f;
        return this;
      }
      return f;
    }


    private getPos(container) : Svg.Point {
      var xy = d3.event.sourceEvent instanceof MouseEvent
        ? d3.mouse(container)
        : (<any>d3.touches)(container, (<any>d3.event.sourceEvent).changedTouches)[0];
      return new Svg.Point(xy[0], xy[1]);
    }

    /**
     * @method appendNode
     * @return {egrid.G
     */
    appendNode(text : string) : DAG {
      if (text) {
        var node;
        if (node = this.grid().findNode(text)) {
          // node already exists
        } else {
          // create new node
          node = this.createNode(text);
          node.original = true;
          this.grid().appendNode(node);
          this.draw();
        }
        var addedElement = this.contentsSelection
            .selectAll(".element")
            .filter(node => node.text == text);
        //this.selectElement(addedElement);
        //this.focusNode(addedElement.datum());
        this.notify();
      }
      return this;
    }

    private createNode(text : string) : Node {
      var node : any = new egrid.Node(text);
      node.factor = true;
      return node;
    }
  }


  /**
   * @return {egrid.SEM}
   */
  export function sem() : SEM {
    return new SEM;
  }
}
