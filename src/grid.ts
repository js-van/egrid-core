/// <reference path="lib/dagre.d.ts"/>
/// <reference path="svg.ts"/>

module egrid {
  export interface NodeData {
    text : string;
    weight : number;
    original : boolean;
  }


  export interface LinkData {
    source : number;
    target : number;
    weight : number;
  }


  export interface GridData {
    nodes : NodeData[];
    links : LinkData[];
  }


  /**
  @class egrid.Node
  */
  export class Node implements NodeData {
    public index : number;
    public x : number;
    public y : number;
    public baseWidth : number;
    public baseHeight : number;
    public width : number;
    public height : number;
    public theta : number;
    public text : string;
    public dagre : any;
    public weight : number;
    public key : number;
    public original : boolean;
    public isTop : boolean;
    public isBottom : boolean;
    public active : boolean;
    public participants : string[];
    private static nextKey = 0;


    /**
    @class egrid.Node
    @constructor
    */
    constructor(
        text : string, weight : number = undefined,
        original : boolean = undefined, participants : string [] = undefined) {
      this.text = text;
      this.x = 0;
      this.y = 0;
      this.theta = 0;
      this.weight = weight || 1;
      this.key = Node.nextKey++;
      this.active = true;
      this.original = original || false;
      this.participants = participants || [];
    }


    left() : Svg.Point {
      return Svg.Rect.left(this.x, this.y, this.width, this.height);
    }


    right() : Svg.Point {
      return Svg.Rect.right(this.x, this.y, this.width, this.height);
    }


    top() : Svg.Point {
      return Svg.Rect.top(this.x, this.y, this.width, this.height);
    }


    bottom() : Svg.Point {
      return Svg.Rect.bottom(this.x, this.y, this.width, this.height);
    }


    center() : Svg.Point {
      return Svg.Rect.center(this.x, this.y, this.width, this.height);
    }


    toString() : string {
      return this.key.toString();
    }
  }


  /**
  @class egrid.Link
  */
  export class Link {
    public index : number;
    public points : Svg.Point[];
    public previousPoints : Svg.Point[];
    public dagre : any;
    public weight : number;
    public key : number;
    private static nextKey = 0;


    /**
    @class egrid.Link
    @constructor
    */
    constructor(public source : Node, public target : Node, weight : number = undefined) {
      this.weight = weight || 1;
      this.key = Link.nextKey++;
    }


    toString() : string {
      return this.key.toString();
    }
  }


  interface Command {
    execute : () => void;
    revert : () => void;
  }


  class CommandTransaction {
    private commands : Command[] = [];


    execute() : void {
      this.commands.forEach((command) => {
        command.execute();
      });
    }


    revert() : void {
      this.commands.reverse().forEach(command => {
        command.revert();
      });
      this.commands.reverse();
    }


    push(command : Command) : void {
      this.commands.push(command);
    }
  }


  export enum RankDirection {
    LR,
    TB,
  }


  export interface LayoutOption {
    lineUpTop? : boolean;
    lineUpBottom? : boolean;
    rankDirection? : RankDirection;
  }


  /**
  @class egrid.Grid
  */
  export class Grid {
    private nodes_ : Node[];
    private links_ : Link[];
    private paths : Link[];
    private linkMatrix : boolean[][];
    private pathMatrix : boolean[][];
    private undoStack : CommandTransaction[];
    private redoStack : CommandTransaction[];
    private transaction : CommandTransaction;
    private checkActive_ : boolean;
    private minimumWeight_ : number;


    /**
    @class egrid.Grid
    @constructor
    */
    constructor() {
      this.nodes_ = [];
      this.links_ = [];
      this.paths = [];
      this.undoStack = [];
      this.redoStack = [];
      this.linkMatrix = [];
      this.pathMatrix = [];
    }


    appendNode(node : Node) : void {
      this.execute({
        execute : () => {
          node.index = this.nodes_.length;
          this.nodes_.push(node);
          this.updateConnections();
        },
        revert : () => {
          node.index = undefined;
          this.nodes_.pop();
          this.updateConnections();
        }
      });
    }


    appendLink(sourceIndex : number, targetIndex : number) : Link {
      var sourceNode = this.nodes_[sourceIndex];
      var targetNode = this.nodes_[targetIndex];
      var link = new Link(sourceNode, targetNode);
      this.execute({
        execute : () => {
          this.links_.push(link);
          this.updateLinkIndex();
          this.updateConnections();
        },
        revert : () => {
          this.links_.pop();
          this.updateLinkIndex();
          this.updateConnections();
        }
      });
      return link;
    }


    removeNode(removeNodeIndex : number) : void {
      var removeNode = this.nodes_[removeNodeIndex];
      var removedLinks;
      var previousLinks;
      this.execute({
        execute : () => {
          this.nodes_.splice(removeNodeIndex, 1);
          previousLinks = this.links_;
          this.links_ = this.links_.filter(link => {
            return link.source != removeNode && link.target != removeNode;
          });
          this.updateNodeIndex();
          this.updateConnections();
        },
        revert : () => {
          this.nodes_.splice(removeNodeIndex, 0, removeNode);
          this.links_ = previousLinks;
          this.updateNodeIndex();
          this.updateConnections();
        }
      });
    }


    removeLink(removeLinkIndex : number) : void {
      var removeLink = this.links_[removeLinkIndex];
      this.execute({
        execute : () => {
          this.links_.splice(removeLinkIndex, 1);
          this.updateLinkIndex();
          this.updateConnections();
        },
        revert : () => {
          this.links_.splice(removeLinkIndex, 0, removeLink);
          this.updateLinkIndex();
          this.updateConnections();
        }
      });
    }


    updateNodeText(nodeIndex : number, newText : string) : void {
      var node = this.nodes_[nodeIndex];
      var oldText = node.text;
      this.execute({
        execute : () => {
          node.text = newText;
        },
        revert : () => {
          node.text = oldText;
        }
      });
    }


    updateNodeWeight(nodeIndex : number, newWeight : number) : void {
      var node = this.nodes_[nodeIndex];
      var oldWeight = node.weight;
      this.execute({
        execute: () => {
          node.weight = newWeight;
        },
        revert: () => {
          node.weight = oldWeight;
        },
      });
    }


    updateNodeParticipants(nodeIndex : number, newParticipants : string[]) : void {
      var node = this.nodes_[nodeIndex];
      var oldParticipants = node.participants;
      this.execute({
        execute: () => {
          node.participants = newParticipants;
        },
        revert: () => {
          node.participants = oldParticipants;
        },
      });
    }


    updateLinkWeight(linkIndex : number, newWeight : number) : void {
      var link = this.links_[linkIndex];
      var oldWeight = link.weight;
      this.execute({
        execute : () => {
          link.weight = newWeight;
        },
        revert : () => {
          link.weight = oldWeight;
        }
      });
    }


    incrementLinkWeight(linkIndex : number) : void {
      this.updateLinkWeight(linkIndex, this.links_[linkIndex].weight + 1);
    }


    decrementLinkWeight(linkIndex : number) : void {
      this.updateLinkWeight(linkIndex, this.links_[linkIndex].weight - 1);
    }


    mergeNode(fromIndex : number, toIndex : number) : void {
      var fromNode = this.nodes_[fromIndex];
      var toNode = this.nodes_[toIndex];
      var newLinks = this.links_
        .filter(link => {
          return (link.source == fromNode && !this.hasPath(toNode.index, link.target.index))
          || (link.target == fromNode && !this.hasPath(link.source.index, toNode.index));
        })
        .map(link => {
          if (link.source == fromNode) {
            return new Link(toNode, link.target);
          } else {
            return new Link(link.source, toNode);
          }
        });
      this.transactionWith(() => {
        this.updateNodeText(toIndex, toNode.text + ", " + fromNode.text);
        this.updateNodeWeight(toIndex, toNode.weight + fromNode.weight);
        this.updateNodeParticipants(toIndex, toNode.participants.concat(fromNode.participants));
        this.removeNode(fromIndex);
        this.execute({
          execute : () => {
            newLinks.forEach(link => {
              this.links_.push(link);
            });
            this.updateConnections();
          },
          revert : () => {
            for(var i = 0; i < newLinks.length; ++i) {
              this.links_.pop();
            }
            this.updateConnections();
          }
        });
      });
    }


    radderUpAppend(fromIndex : number, newNode : Node) : void {
      this.transactionWith(() => {
        this.appendNode(newNode);
        this.radderUp(fromIndex, newNode.index);
      });
    }


    radderUp(fromIndex : number, toIndex : number) : Link {
      return this.appendLink(toIndex, fromIndex);
    }


    radderDownAppend(fromIndex : number, newNode : Node) : void {
      this.transactionWith(() => {
        this.appendNode(newNode);
        this.radderDown(fromIndex, newNode.index);
      });
    }


    radderDown(fromIndex : number, toIndex : number) : Link {
      return this.appendLink(fromIndex, toIndex);
    }


    canUndo() : boolean {
      return this.undoStack.length > 0;
    }


    undo() : void {
      var commands = this.undoStack.pop();
      commands.revert();
      this.redoStack.push(commands);
    }


    canRedo() : boolean {
      return this.redoStack.length > 0;
    }


    redo() : void {
      var commands = this.redoStack.pop();
      commands.execute();
      this.undoStack.push(commands);
    }


    toJSON() : GridData {
      return {
        nodes : this.nodes_.map(node => {
          return {
            text : node.text,
            weight : node.weight,
            original : node.original
          };
        }),
        links : this.links_.map(link => {
          return {
            source : link.source.index,
            target : link.target.index,
            weight : link.weight
          }
        })
      };
    }


    nodes() : Node[];
    nodes(nodes : Node[]) : Grid;
    nodes(arg? : Node[]) : any {
      if (arg === undefined) {
        return this.nodes_;
      }
      this.nodes_ = arg;
      this.updateNodeIndex();
      this.updateConnections();
      return this;
    }


    activeNodes() : Node[] {
      return this.nodes().filter(node => {
        return (!this.checkActive_ || node.active) && node.weight >= this.minimumWeight_;
      });
    }


    findNode(text : string) : Node {
      var result = null;
      this.nodes_.forEach(node => {
        if (node.text == text) {
          result = node;
        }
      });
      return result;
    }


    links() : Link[];
    links(links : Link[]) : Grid;
    links(arg? : Link[]) : any {
      if (arg === undefined) {
        return this.links_;
      }
      this.links_ = arg;
      this.updateLinkIndex();
      this.updateConnections();
      return this;
    }


    activeLinks() : Link[] {
      var removeNodes = this.nodes().filter(node => {
        return node.weight < this.minimumWeight_;
      });
      var newPathMatrix = this.linkMatrix.map(row => row.map(v => v));
      removeNodes.forEach(node => {
        var i, j, k = node.index, n = this.nodes_.length;
        for (i = 0; i < n; ++i) {
          for (j = 0; j < n; ++j) {
            if (newPathMatrix[i][k] && newPathMatrix[k][j]) {
              newPathMatrix[i][j] = true;
            }
          }
        }
      });
      return this.paths.filter(link => {
        return newPathMatrix[link.source.index][link.target.index]
          && (!this.checkActive_ || link.source.active)
          && link.source.weight >= this.minimumWeight_
          && (!this.checkActive_ || link.target.active)
          && link.target.weight >= this.minimumWeight_;
      });
    }


    link(linkIndex : number) : Link;
    link(fromNodeIndex : number, toNodeIndex : number) : Link;
    link(index1 : number, index2 : number=undefined) : Link {
      if (index2 === undefined) {
        return this.links_[index1];
      } else {
        return this.links_.reduce((p, link) => {
          if (link.source.index == index1 && link.target.index == index2) {
            return link;
          } else {
            return p;
          }
        }, undefined);
      }
    }


    layout(options : LayoutOption) : void {
      var lineUpTop = options.lineUpTop === undefined ? true : options.lineUpTop;
      var lineUpBottom = options.lineUpBottom === undefined ? true : options.lineUpBottom;
      var rankDirection = options.rankDirection === undefined || options.rankDirection == RankDirection.LR ? 'LR' : 'TB';

      var nodes = this.activeNodes();
      var links = this.activeLinks();

      dagre.layout()
        .nodes(nodes)
        .edges(links)
        .lineUpTop(lineUpTop)
        .lineUpBottom(lineUpBottom)
        .rankDir(rankDirection)
        .rankSep(200)
        .edgeSep(20)
        .run()
        ;

      nodes.forEach(node => {
        node.x = node.dagre.x;
        node.y = node.dagre.y;
        node.width = node.dagre.width;
        node.height = node.dagre.height;
      });

      links.forEach(link => {
        link.previousPoints = link.points;
        link.points = link.dagre.points.map(p => p);
        link.points.unshift(link.source.center());
        link.points.push(link.target.center());
      });
    }


    hasPath(fromIndex : number, toIndex : number) : boolean {
      return this.pathMatrix[fromIndex][toIndex];
    }


    hasLink(fromIndex : number, toIndex : number) : boolean {
      return this.linkMatrix[fromIndex][toIndex];
    }


    numConnectedNodes(index : number) : number {
      var result = 0;
      this.activeNodes().forEach(node => {
        if (this.pathMatrix[index][node.index] || this.pathMatrix[node.index][index]) {
          result += 1;
        }
      })
      return result;
    }


    checkActive() : boolean;
    checkActive(flag : boolean) : Grid;
    checkActive(arg? : boolean) : any {
      if (arg === undefined) {
        return this.checkActive_;
      } else {
        this.checkActive_ = arg;
        return this;
      }
    }


    minimumWeight() : number;
    minimumWeight(value : number) : Grid;
    minimumWeight(arg? : number) : any {
      if (arg === undefined) {
        return this.minimumWeight_;
      } else {
        this.minimumWeight_ = arg;
        return this;
      }
    }


    private execute(command : Command) : void {
      if (this.transaction) {
        command.execute();
        this.transaction.push(command);
      } else {
        this.transactionWith(() => {
          this.execute(command);
        });
      }
    }


    private transactionWith(f : () => void) : void {
      this.beginTransaction();
      f();
      this.commitTransaction();
    }


    private beginTransaction() : void {
      this.transaction = new CommandTransaction();
    }


    private commitTransaction() : void {
      this.undoStack.push(this.transaction);
      this.redoStack = [];
      this.transaction = undefined;
    }


    private rollbackTransaction() : void {
      this.transaction.revert();
      this.transaction = undefined;
    }


    private updateConnections() : void {
      this.linkMatrix = this.nodes_.map(_ => {
        return this.nodes_.map(_ => {
          return false;
        });
      });
      this.links_.forEach(link => {
        this.linkMatrix[link.source.index][link.target.index] = true;
      });

      this.nodes_.forEach((node, index1) => {
        node.isTop = this.nodes_.every((_, index2) => !this.linkMatrix[index2][index1]);
        node.isBottom = this.nodes_.every((_, index2) => !this.linkMatrix[index1][index2]);
      });

      this.pathMatrix = this.nodes_.map((_, fromIndex) => {
        return this.nodes_.map((_, toIndex) => {
          return fromIndex == toIndex || this.linkMatrix[fromIndex][toIndex];
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

      this.paths = this.links_.map(link => link);
      for (i = 0; i < n; ++i) {
        for (j = 0; j < n; ++j) {
          if (this.pathMatrix[i][j] && !this.linkMatrix[i][j]) {
            this.paths.push(new Link(this.nodes_[i], this.nodes_[j]));
          }
        }
      }
    }


    private updateNodeIndex() : void {
      this.nodes_.forEach((node : Node, i : number) => {
        node.index = i;
      });
    }


    private updateLinkIndex() : void {
      this.links_.forEach((link : Link, i : number) => {
        link.index = i;
      });
    }


    private updateIndex() : void {
      this.updateNodeIndex();
      this.updateLinkIndex();
    }
  }
}
