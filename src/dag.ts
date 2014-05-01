/// <reference path="typings/d3/d3.d.ts"/>
/// <reference path="grid.ts"/>

module egrid {
  export class DAG {
    private grid_ : Grid;
    private uiCallback : () => void;


    /**
     * @class egrid.DAG
     * @constructor
     */
    constructor () {
      this.grid_ = new Grid;
    }


    /**
     * @method grid
     * @return {egrid.Grid}
     */
    grid() : Grid {
      return this.grid_;
    }


    nodes() : Node[];
    nodes(nodes : Node[]) : DAG;
    /**
     * @method nodes
     * @param {Egm.Node[]} [nodes] new nodes.
     * @return {egrid.DAG|egrid.Node[]} Returns self if nodes is specified. Otherwise, returns current nodes.
     */
    nodes(arg? : Node[]) : any {
      if (arg === undefined) {
        return this.grid_.activeNodes();
      }
      this.grid_.nodes(arg);
      return this;
    }


    links() : Link[];
    links(links : Link[]) : DAG;
    /**
     * @method links
     * @param {Egm.Link[]} [links] new links.
     * @return {egrid.DAG|egrid.Link} Returns self if links is specified. Otherwise, returns current links.
     */
    links(arg? : Link[]) : any {
      if (arg === undefined) {
        return this.grid_.activeLinks();
      }
      this.grid_.links(arg);
      return this;
    }


    /**
     * @method notify
     */
    notify() : DAG {
      if (this.uiCallback) {
        this.uiCallback();
      }
      return this;
    }


    /**
     * @method registerUiCallback;
     */
    registerUiCallback(callback : () => void) : DAG {
      this.uiCallback = callback;
      return this;
    }


    /**
     * @method undo
     */
    undo() : DAG {
      if (this.grid().canUndo()) {
        this.grid().undo();
        this.draw();
        this.notify();
      }
      return this;
    }


    /**
     * @method redo
     */
    redo() : DAG {
      if (this.grid().canRedo()) {
        this.grid().redo();
        this.draw();
        this.notify();
      }
      return this;
    }


    /**
     * @method draw
     */
    draw() : DAG {
      return this;
    }


    /**
     * @method focusCenter
     */
    focusCenter() : DAG {
      return this;
    }


    /**
     * Generates a function to init display region.
     * @method display
     * @param regionWidth {number} Width of display region.
     * @param regionHeight {number} Height of display region.
     * @return {function}
     */
    display(regionWidth : number = undefined, regionHeight : number = undefined) : (selection : D3.Selection) => void {
      return (selection) => {};
    }
  }
}
