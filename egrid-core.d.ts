/// <reference path="../d3/d3.d.ts"/>

declare module egrid {
  module core {
    interface LinkJson {
      source: number;
      target: number;
    }

    interface GraphJson {
      nodes: any[];
      links: LinkJson[];
    }

    interface Graph<P, Q> {
      vertices(): number[];
      edges(): [number, number][];
      adjacentVertices(u: number): number[];
      invAdjacentVertices(u: number): number[];
      outEdges(u: number): [number, number][];
      inEdges(u: number): [number, number][];
      outDegree(u: number): number;
      inDegree(u: number): number;
      numVertices(): number;
      numEdges(): number;
      vertex(u: number): number;
      edge(u: number, v: number): boolean;
      addEdge(u: number, v: number, prop?: Q): [number, number];
      removeEdge(u: number, v: number): void;
      addVertex(prop: P, u?: number): number;
      clearVertex(u: number): void;
      removeVertex(u: number): void;
      get(u: number): P;
      get(u: number, v: number): Q;
      set(u: number, prop: P): void;
      set(u: number, v: number, prop: Q): void;
    }

    module graph {
      function adjacencyList<P, Q>(): Graph<P, Q>;

      function dumpJSON(graph: Graph<any, any>): GraphJson;

      interface WarshallFloyd<P> {
        (graph: Graph<P, any>): {[u: number]: {[v: number]: number}};
        weight(): (node: P) => number;
        weight(f: (node: P) => number): WarshallFloyd<P>;
      }

      function warshallFloyd<P>(): WarshallFloyd<P>;
    }

    interface GridNode {
      text: string;
    }

    interface GridLink {
    }

    interface Grid<P extends GridNode, Q extends GridLink> {
      graph(): Graph<P, Q>;
      addConstruct(text: string): number;
      removeConstruct(u: number): void;
      updateConstruct(u: number, property: string, value: any): void;
      addEdge(u: number, v: number): void;
      removeEdge(u: number, v: number): void;
      ladderUp(u: number, text: string): number;
      ladderDown(u: number, text: string): number;
      merge(u: number, v: number, f?: (u: number, v: number) => P): number;
      group(us: number[], attrs?: P[]): number;
      ungroup(u: number): void;
      canUndo(): boolean;
      canRedo(): boolean;
      undo(): void;
      redo(): void;
    }

    function grid<P extends GridNode, Q extends GridLink>(vertices?: any[], edges?: any[]): Grid<P, Q>;

    interface VertexButton {
      icon: string;
      onClick(node: any, u: number): void;
    }

    interface EGMCenterOptions {
      scale?: number;
    }

    interface D3Callable {
      (selection: D3.Selection): void;
      (selection: D3.EnterSelection): void;
      (selection: D3.Transition.Transition): void;
    }

    interface EGM<P, Q> extends D3Callable {
      /**
       * global attributes
       */
      backgroundColor(): string;
      backgroundColor(arg: string): EGM<P, Q>;
      contentsMargin(): number;
      contentsMargin(arg: number): EGM<P, Q>;
      contentsScaleMax(): number;
      contentsScaleMax(arg: number): EGM<P, Q>;
      dagreEdgeSep(): number;
      dagreEdgeSep(arg: number): EGM<P, Q>;
      dagreNodeSep(): number;
      dagreNodeSep(arg: number): EGM<P, Q>;
      dagreRanker(): (g: Graph<any, any>) => void;
      dagreRanker(arg: (g: Graph<any, any>) => void): EGM<P, Q>;
      dagreRankDir(): string;
      dagreRankDir(arg: string): EGM<P, Q>;
      dagreRankSep(): number;
      dagreRankSep(arg: number): EGM<P, Q>;
      edgeInterpolate(): string;
      edgeInterpolate(arg: string): EGM<P, Q>;
      edgeTension(): number;
      edgeTension(arg: number): EGM<P, Q>;
      enableClickVertex(): boolean;
      enableClickVertex(arg: boolean): EGM<P, Q>;
      enableZoom(): boolean;
      enableZoom(arg: boolean): EGM<P, Q>;
      lowerStrokeColor(): string;
      lowerStrokeColor(arg: string): EGM<P, Q>;
      maxTextLength(): number;
      maxTextLength(arg: number): EGM<P, Q>;
      onClickVertex(): (d: P, u: number) => any;
      onClickVertex(arg: (d: P, u: number) => any): EGM<P, Q>;
      selectedStrokeColor(): string;
      selectedStrokeColor(arg: string): EGM<P, Q>;
      strokeColor(): string;
      strokeColor(arg: string): EGM<P, Q>;
      textSeparator(): (text: string) => string[];
      textSeparator(arg: (text: string) => string[]): EGM<P, Q>;
      vertexButtons(): VertexButton[];
      vertexButtons(arg: VertexButton[]): EGM<P, Q>;
      size(): number[];
      size(arg: number[]): EGM<P, Q>;
      upperStrokeColor(): string;
      upperStrokeColor(arg: string): EGM<P, Q>;

      /**
       * vertex attributes
       */
      vertexAveilability(): (node: P, u: number) => boolean;
      vertexAveilability(arg: (node: P, u: number) => boolean): EGM<P, Q>;
      vertexColor(): (node: P, u: number) => string;
      vertexColor(arg: (node: P, u: number) => string): EGM<P, Q>;
      vertexFontWeight(): (node: P, u: number) => string;
      vertexFontWeight(arg: (node: P, u: number) => string): EGM<P, Q>;
      vertexOpacity(): (node: P, u: number) => number;
      vertexOpacity(arg: (node: P, u: number) => number): EGM<P, Q>;
      vertexScale(): (node: P, u: number) => number;
      vertexScale(arg: (node: P, u: number) => number): EGM<P, Q>;
      vertexStrokeWidth(): (node: P, u: number) => number;
      vertexStrokeWidth(arg: (node: P, u: number) => number): EGM<P, Q>;
      vertexText(): (node: P, u: number) => string;
      vertexText(arg: (node: P, u: number) => string): EGM<P, Q>;
      vertexVisibility(): (node: P, u: number) => boolean;
      vertexVisibility(arg: (node: P, u: number) => boolean): EGM<P, Q>;

      /**
       * edge attributes
       */
      edgeColor(): (u: number, v: number) => string;
      edgeColor(arg: (u: number, v: number) => string): EGM<P, Q>;
      edgeOpacity(): (u: number, v: number) => number;
      edgeOpacity(arg: (u: number, v: number) => number): EGM<P, Q>;
      edgeText(): (u: number, v: number) => string;
      edgeText(arg: (u: number, v: number) => string): EGM<P, Q>;
      edgeVisibility(): (u: number, v: number) => boolean;
      edgeVisibility(arg: (u: number, v: number) => boolean): EGM<P, Q>;
      edgeWidth(): (u: number, v: number) => number;
      edgeWidth(arg: (u: number, v: number) => number): EGM<P, Q>;

      /**
       * centering the svg
       */
      center(arg?: EGMCenterOptions): D3Callable;

      /**
       * apply styles to the svg
       */
      css(): D3Callable;

      /**
       * resize the svg
       */
      resize(width: number, height: number): D3Callable;

      /**
       * update color attributes
       */
      updateColor(): D3Callable;
    }

    function egm<P, Q>(): EGM<P, Q>;

    module network {
      module centrality {
        function katz<P, Q>(graph: Graph<P, Q>): {[u: number]: number};
      }

      module community {
        function newman<P, Q>(graph: Graph<P, Q>): number[][];
      }
    }
  }
}
