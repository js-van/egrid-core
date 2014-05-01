/// <reference path="typings/d3/d3.d.ts"/>
/// <reference path="egm.ts"/>

module egrid {
  export interface AppendNodeButton {
    (selection : D3.Selection) : AppendNodeButton;
    onClick(f : (callback : (result : string) => void) => void) : AppendNodeButton;
  }


  export interface RemoveNodeButton {
    (selection : D3.Selection) : RemoveNodeButton;
    onEnable(f : (selection : D3.Selection) => void) : RemoveNodeButton;
    onDisable(f : () => void) : RemoveNodeButton;
  }


  export interface MergeNodeButton {
    (selection : D3.Selection) : MergeNodeButton;
    onEnable(f : (selection : D3.Selection) => void) : MergeNodeButton;
    onDisable(f : () => void) : MergeNodeButton;
  }


  export interface EditNodeButton {
    (selection : D3.Selection) : EditNodeButton;
    onClick(f : (callback : (result : string) => void) => void) : EditNodeButton;
    onEnable(f : (selection : D3.Selection) => void) : EditNodeButton;
    onDisable(f : () => void) : EditNodeButton;
  }


  export interface RadderUpButton {
    (selection : D3.Selection) : RadderUpButton;
    onClick(f : (callback : (result : string) => void) => void) : RadderUpButton;
    onEnable(f : (selection : D3.Selection) => void) : RadderUpButton;
    onDisable(f : () => void) : RadderUpButton;
  }


  export interface RadderDownButton {
    (selection : D3.Selection) : RadderDownButton;
    onClick(f : (callback : (result : string) => void) => void) : RadderDownButton;
    onEnable(f : (selection : D3.Selection) => void) : RadderDownButton;
    onDisable(f : () => void) : RadderDownButton;
  }


  export interface UndoButton {
    (selection : D3.Selection) : UndoButton;
    onEnable(f : () => void) : UndoButton;
    onDisable(f : () => void) : UndoButton;
  }


  export interface RedoButton {
    (selection : D3.Selection) : RedoButton;
    onEnable(f : () => void) : RedoButton;
    onDisable(f : () => void) : RedoButton;
  }


  export interface SaveButton {
    (selection : D3.Selection) : SaveButton;
    save(f : (json : GridData) => void) : SaveButton;
  }


  /**
   * @class egrid.EGMUi
   */
  export class EGMUi {
    private egm_ : EGM;
    private onEnableRemoveNodeButton : (selection : D3.Selection) => void;
    private onDisableRemoveNodeButton : () => void;
    private onEnableMergeNodeButton : (selection : D3.Selection) => void;
    private onDisableMergeNodeButton : () => void;
    private onEnableEditNodeButton : (selection : D3.Selection) => void;
    private onDisableEditNodeButton : () => void;
    private onEnableRadderUpButton : (selection : D3.Selection) => void;
    private onDisableRadderUpButton : () => void;
    private onEnableRadderDownButton : (selection : D3.Selection) => void;
    private onDisableRadderDownButton : () => void;
    private onEnableUndoButton : () => void;
    private onDisableUndoButton : () => void;
    private onEnableRedoButton : () => void;
    private onDisableRedoButton : () => void;
    private onClickSaveButton : (json : GridData) => void;


    /**
     * @class egrid.EGMUi
     * @constructor
     */
    constructor () {
      this.egm_ = new EGM();
      this.egm_.registerUiCallback(() => {
        this.updateNodeButtons();
        this.updateUndoButton();
        this.updateRedoButton();
      });
    }


    egm() : EGM {
      return this.egm_;
    }


    appendNodeButton() : AppendNodeButton {
      var egmui = this;
      var onClickPrompt;
      var f : any = function(selection : D3.Selection) : AppendNodeButton {
        selection.on("click", () => {
          onClickPrompt && onClickPrompt((text : string) : void => {
            egmui.egm().appendNode(text);
          });
        });
        return this;
      };
      f.onClick = function(f : (callback : (result : string) => void) => void) : AppendNodeButton {
        onClickPrompt = f;
        return this;
      }
      return f;
    }


    removeNodeButton() : RemoveNodeButton {
      var egmui = this;
      var f : any = function(selection : D3.Selection) : RemoveNodeButton {
        selection.on("click", () => {
          egmui.egm().removeSelectedNode();
        });
        return this;
      };
      f.onEnable = function(f : (selection : D3.Selection) => void) : RemoveNodeButton {
        egmui.onEnableRemoveNodeButton = f;
        return this;
      };
      f.onDisable = function(f : () => void) : RemoveNodeButton {
        egmui.onDisableRemoveNodeButton = f;
        return this;
      };
      return f;
    }


    mergeNodeButton() : MergeNodeButton {
      var egmui = this;
      var f : any = function(selection : D3.Selection) : MergeNodeButton {
        selection.call(egmui.egm().dragNode()
            .isDroppable((fromNode : Node, toNode : Node) : boolean => {
              return !egmui.egm().grid().hasPath(toNode.index, fromNode.index)
            })
            .dragToNode((fromNode : Node, toNode : Node) : void => {
              egmui.egm().mergeNode(fromNode, toNode);
            }));
        return this;
      }
      f.onEnable = function(f : (selection : D3.Selection) => void) : MergeNodeButton {
        egmui.onEnableMergeNodeButton = f;
        return this;
      };
      f.onDisable = function(f : () => void) : MergeNodeButton {
        egmui.onDisableMergeNodeButton = f;
        return this;
      };
      return f;
    }


    editNodeButton() : EditNodeButton {
      var egmui = this;
      var onClickPrompt;
      var f : any = function(selection : D3.Selection) : EditNodeButton {
        selection.on("click", () => {
          onClickPrompt && onClickPrompt((text : string) : void => {
            egmui.egm().editSelectedNode(text);
          });
        })
        return this;
      };
      f.onClick = function(f : (callback : (result : string) => void) => void) : EditNodeButton {
        onClickPrompt = f;
        return this;
      };
      f.onEnable = function(f : (selection : D3.Selection) => void) : EditNodeButton {
        egmui.onEnableEditNodeButton = f;
        return this;
      };
      f.onDisable = function(f : () => void) : EditNodeButton {
        egmui.onDisableEditNodeButton = f;
        return this;
      };
      return f;
    }


    radderUpButton() : RadderUpButton {
      var egmui = this;
      var f : any = (selection : D3.Selection) : void => {
        egmui.egm().raddering(selection, Raddering.RadderUp);
      }
      f.onClick = function(f : (callback : (result : string) => void) => void) : RadderUpButton {
        egmui.egm().openLadderUpPrompt = f;
        return this;
      };
      f.onEnable = function(f : (selection : D3.Selection) => void) : RadderUpButton {
        egmui.onEnableRadderUpButton = f;
        return this;
      };
      f.onDisable = function(f : () => void) : RadderUpButton {
        egmui.onDisableRadderUpButton = f;
        return this;
      };
      return f;
    }


    radderDownButton() : RadderDownButton {
      var egmui = this;
      var f : any = function(selection : D3.Selection) : RadderDownButton {
        egmui.egm().raddering(selection, Raddering.RadderDown);
        return this;
      }
      f.onClick = function(f : (callback : (result : string) => void) => void) : RadderDownButton {
        egmui.egm().openLadderDownPrompt = f;
        return this;
      };
      f.onEnable = function(f : (selection : D3.Selection) => void) : RadderDownButton {
        egmui.onEnableRadderDownButton = f;
        return this;
      }
      f.onDisable = function(f : () => void) : RadderDownButton {
        egmui.onDisableRadderDownButton = f;
        return this;
      }
      return f;
    }


    saveButton() : SaveButton {
      var egmui = this;
      var f : any = function(selection : D3.Selection) : SaveButton {
        selection.on("click", () => {
          if (egmui.onClickSaveButton) {
            egmui.onClickSaveButton(egmui.egm().grid().toJSON());
          }
        });
        return this;
      }
      f.save = function(f : (jsonString : GridData) => void) : SaveButton {
        egmui.onClickSaveButton = f;
        return this;
      }
      return f;
    }


    undoButton() : UndoButton {
      var egmui = this;
      var egm = this.egm();
      var f : any = function(selection : D3.Selection) : UndoButton {
        selection.on("click", () => {
          egm.undo();
        });
        return this;
      }
      f.onEnable = function(f : () => void) : UndoButton {
        egmui.onEnableUndoButton = f;
        return this;
      }
      f.onDisable = function(f : () => void) : UndoButton {
        egmui.onDisableUndoButton = f;
        return this;
      }
      return f;
    }


    redoButton() : RedoButton {
      var egmui = this
      var egm = this.egm();
      var f : any = function(selection : D3.Selection) : RedoButton {
        selection.on("click", () => {
          egm.redo();
        });
        return this;
      }
      f.onEnable = function(f : () => void) : RedoButton {
        egmui.onEnableRedoButton = f;
        return this;
      }
      f.onDisable = function(f : () => void) : RedoButton {
        egmui.onDisableRedoButton = f;
        return this;
      }
      return f;
    }


    private updateNodeButtons() {
      var egm = this.egm();
      var selectedNode = egm.selectedNode();
      if (selectedNode) {
        this.enableNodeButtons();
      } else {
        this.disableNodeButtons();
      }
    }


    private enableNodeButtons() {
      var selection = d3.select(".selected");
      this.enableRemoveNodeButton(selection);
      this.enableMergeNodeButton(selection);
      this.enableEditNodeButton(selection);
      this.enableRadderUpButton(selection);
      this.enableRadderDownButton(selection);
    }


    private disableNodeButtons() {
      this.disableRemoveNodeButton();
      this.disableMergeNodeButton();
      this.disableEditNodeButton();
      this.disableRadderUpButton();
      this.disableRadderDownButton();
    }


    private enableRadderUpButton(selection : D3.Selection) : void {
      if (this.onEnableRadderUpButton) {
        this.onEnableRadderUpButton(selection);
      }
    }


    private disableRadderUpButton() : void {
      if (this.onDisableRadderUpButton) {
        this.onDisableRadderUpButton();
      }
    }


    private enableRadderDownButton(selection : D3.Selection) : void {
      if (this.onEnableRadderDownButton) {
        this.onEnableRadderDownButton(selection);
      }
    }


    private disableRadderDownButton() : void {
      if (this.onDisableRadderDownButton) {
        this.onDisableRadderDownButton();
      }
    }


    private enableRemoveNodeButton(selection : D3.Selection) : void {
      if (this.onEnableRemoveNodeButton) {
        this.onEnableRemoveNodeButton(selection);
      }
    }


    private disableRemoveNodeButton() : void {
      if (this.onDisableRemoveNodeButton) {
        this.onDisableRemoveNodeButton();
      }
    }


    private enableMergeNodeButton(selection : D3.Selection) : void {
      if (this.onEnableMergeNodeButton) {
        this.onEnableMergeNodeButton(selection);
      }
    }


    private disableMergeNodeButton() : void {
      if (this.onDisableMergeNodeButton) {
        this.onDisableMergeNodeButton();
      }
    }


    private enableEditNodeButton(selection : D3.Selection) : void {
      if (this.onEnableEditNodeButton) {
        this.onEnableEditNodeButton(selection);
      }
    }


    private disableEditNodeButton() : void {
      if (this.onDisableEditNodeButton) {
        this.onDisableEditNodeButton();
      }
    }


    private enableUndoButton() : void {
      if (this.onEnableUndoButton) {
        this.onEnableUndoButton();
      }
    }


    private disableUndoButton() : void {
      if (this.onDisableUndoButton) {
        this.onDisableUndoButton();
      }
    }


    private enableRedoButton() : void {
      if (this.onEnableRedoButton) {
        this.onEnableRedoButton();
      }
    }


    private disableRedoButton() : void {
      if (this.onDisableRedoButton) {
        this.onDisableRedoButton();
      }
    }


    private updateUndoButton() : void {
      if (this.egm().grid().canUndo()) {
        this.enableUndoButton();
      } else {
        this.disableUndoButton();
      }
    }


    private updateRedoButton() : void {
      if (this.egm().grid().canRedo()) {
        this.enableRedoButton();
      } else {
        this.disableRedoButton();
      }
    }
  }


  /**
   * @return {egrid.EGMUi}
   */
  export function egmui() : EGMUi {
    return new EGMUi;
  }
}
