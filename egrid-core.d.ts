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

    interface Graph<T> {
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
      addEdge(u: number, v: number, prop?: T): [number, number];
      removeEdge(u: number, v: number): void;
      addVertex(prop: T, u?: number): number;
      clearVertex(u: number): void;
      removeVertex(u: number): void;
      get(u: number, v?: number): T;
      set(u: number, prop: T): void;
      set(u: number, v: number, prop: T): void;
    }

    module graph {
      function adjacencyList<T>(): Graph<T>;

      function dumpJSON<T>(graph: Graph<T>): GraphJson;

      interface WarshallFloyd<T> {
        (graph: Graph<T>): {[u: number]: {[v: number]: number}};
        weight(): (node: any) => number;
        weight(f: (node: any) => number): WarshallFloyd<T>;
      }

      function warshallFloyd<T>(): WarshallFloyd<T>;
    }

    interface Grid<T> {
      graph(): Graph<T>;
      addConstruct(text: string): number;
      removeConstruct(u: number): void;
      updateConstruct(u: number, property: string, value: any): void;
      addEdge(u: number, v: number): void;
      removeEdge(u: number, v: number): void;
      ladderUp(u: number, text: string): number;
      ladderDown(u: number, text: string): number;
      merge(u: number, v: number, f?: (u: number, v: number) => any): number;
      group(us: number[], attrs?: any): number;
      ungroup(u: number): void;
      canUndo(): boolean;
      canRedo(): boolean;
      undo(): void;
      redo(): void;
    }

    function grid<T>(vertices?: any[], edges?: any[]): Grid<T>;

    interface VertexButton {
      icon: string;
      onClick(node: any, u: number): void;
    }

    interface EGMCenterOptions {
      scale?: number;
    }

    interface EGM<T> {
      /**
       * global attributes
       */
      backgroundColor(): string;
      backgroundColor(arg: string): EGM<T>;
      contentsMargin(): number;
      contentsMargin(arg: number): EGM<T>;
      contentsScaleMax(): number;
      contentsScaleMax(arg: number): EGM<T>;
      dagreEdgeSep(): number;
      dagreEdgeSep(arg: number): EGM<T>;
      dagreNodeSep(): number;
      dagreNodeSep(arg: number): EGM<T>;
      dagreRanker(): (g: Graph<T>) => void;
      dagreRanker(arg: (g: Graph<T>) => void): EGM<T>;
      dagreRankDir(): string;
      dagreRankDir(arg: string): EGM<T>;
      dagreRankSep(): number;
      dagreRankSep(arg: number): EGM<T>;
      edgeInterpolate(): string;
      edgeInterpolate(arg: string): EGM<T>;
      edgeTension(): number;
      edgeTension(arg: number): EGM<T>;
      enableClickVertex(): boolean;
      enableClickVertex(arg: boolean): EGM<T>;
      enableZoom(): boolean;
      enableZoom(arg: boolean): EGM<T>;
      lowerStrokeColor(): string;
      lowerStrokeColor(arg: string): EGM<T>;
      maxTextLength(): number;
      maxTextLength(arg: number): EGM<T>;
      onClickVertex(): (d: T, u: number) => any;
      onClickVertex(arg: (d: T, u: number) => any): EGM<T>;
      selectedStrokeColor(): string;
      selectedStrokeColor(arg: string): EGM<T>;
      strokeColor(): string;
      strokeColor(arg: string): EGM<T>;
      textSeparator(): (text: string) => string[];
      textSeparator(arg: (text: string) => string[]): EGM<T>;
      vertexButtons(): VertexButton[];
      vertexButtons(arg: VertexButton[]): EGM<T>;
      size(): number[];
      size(arg: number[]): EGM<T>;
      upperStrokeColor(): string;
      upperStrokeColor(arg: string): EGM<T>;

      /**
       * vertex attributes
       */
      vertexAveilability(): (node: T, u: number) => boolean;
      vertexAveilability(arg: (node: T, u: number) => boolean): EGM<T>;
      vertexColor(): (node: T, u: number) => string;
      vertexColor(arg: (node: T, u: number) => string): EGM<T>;
      vertexFontWeight(): (node: T, u: number) => string;
      vertexFontWeight(arg: (node: T, u: number) => string): EGM<T>;
      vertexOpacity(): (node: T, u: number) => number;
      vertexOpacity(arg: (node: T, u: number) => number): EGM<T>;
      vertexScale(): (node: T, u: number) => number;
      vertexScale(arg: (node: T, u: number) => number): EGM<T>;
      vertexStrokeWidth(): (node: T, u: number) => number;
      vertexStrokeWidth(arg: (node: T, u: number) => number): EGM<T>;
      vertexText(): (node: T, u: number) => string;
      vertexText(arg: (node: T, u: number) => string): EGM<T>;
      vertexVisibility(): (node: T, u: number) => boolean;
      vertexVisibility(arg: (node: T, u: number) => boolean): EGM<T>;

      /**
       * edge attributes
       */
      edgeColor(): (u: number, v: number) => string;
      edgeColor(arg: (u: number, v: number) => string): EGM<T>;
      edgeOpacity(): (u: number, v: number) => number;
      edgeOpacity(arg: (u: number, v: number) => number): EGM<T>;
      edgeText(): (u: number, v: number) => string;
      edgeText(arg: (u: number, v: number) => string): EGM<T>;
      edgeVisibility(): (u: number, v: number) => boolean;
      edgeVisibility(arg: (u: number, v: number) => boolean): EGM<T>;
      edgeWidth(): (u: number, v: number) => number;
      edgeWidth(arg: (u: number, v: number) => number): EGM<T>;

      /**
       * draw the graph
       */
      (selection: D3.Selection): void;

      /**
       * centering the svg
       */
      center(arg?: EGMCenterOptions): (selection: D3.Selection) => void;

      /**
       * apply styles to the svg
       */
      css(): (selection: D3.Selection) => void;

      /**
       * resize the svg
       */
      resize(width: number, height: number): (selection: D3.Selection) => void;

      /**
       * update color attributes
       */
      updateColor(): (selection: D3.Selection) => void;
    }

    function egm<T>(): EGM<T>;

    module network {
      module centrality {
        function katz<T>(graph: Graph<T>): {[u: number]: number};
      }

      module community {
        function newman<T>(graph: Graph<T>): number[][];
      }
    }
  }
}
