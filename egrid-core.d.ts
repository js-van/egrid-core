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

    interface Graph {
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
      addEdge(u: number, v: number, prop?: any): [number, number];
      removeEdge(u: number, v: number): void;
      addVertex(prop: any, u?: number): number;
      clearVertex(u: number): void;
      removeVertex(u: number): void;
      get(u: number, v?: number): any;
      set(u: number, prop: any): void;
      set(u: number, v: number, prop: any): void;
    }

    module graph {
      function adjacencyList(): Graph;

      function dumpJSON(graph: Graph): GraphJson;

      interface WarshallFloyd {
        (graph: Graph): {[u: number]: {[v: number]: number}};
        weight(): (node: any) => number;
        weight(f: (node: any) => number): WarshallFloyd;
      }

      function warshallFloyd(): WarshallFloyd;
    }

    interface Grid {
      graph(): Graph;
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

    function grid(vertices?: any[], edges?: any[]): Grid;

    interface VertexButton {
      icon: string;
      onClick(node: any, u: number): void;
    }

    interface EGMCenterOptions {
      scale?: number;
    }

    interface EGM {
      /**
       * global attributes
       */
      backgroundColor(): string;
      backgroundColor(arg: string): EGM;
      contentsMargin(): number;
      contentsMargin(arg: number): EGM;
      contentsScaleMax(): number;
      contentsScaleMax(arg: number): EGM;
      dagreEdgeSep(): number;
      dagreEdgeSep(arg: number): EGM;
      dagreNodeSep(): number;
      dagreNodeSep(arg: number): EGM;
      dagreRanker(): (g: Graph) => void;
      dagreRanker(arg: (g: Graph) => void): EGM;
      dagreRankDir(): string;
      dagreRankDir(arg: string): EGM;
      dagreRankSep(): number;
      dagreRankSep(arg: number): EGM;
      edgeInterpolate(): string;
      edgeInterpolate(arg: string): EGM;
      edgeTension(): number;
      edgeTension(arg: number): EGM;
      enableClickVertex(): boolean;
      enableClickVertex(arg: boolean): EGM;
      enableZoom(): boolean;
      enableZoom(arg: boolean): EGM;
      lowerStrokeColor(): string;
      lowerStrokeColor(arg: string): EGM;
      maxTextLength(): number;
      maxTextLength(arg: number): EGM;
      onClickVertex(): (arg: any) => any;
      onClickVertex(arg: (arg: any) => any): EGM;
      selectedStrokeColor(): string;
      selectedStrokeColor(arg: string): EGM;
      strokeColor(): string;
      strokeColor(arg: string): EGM;
      textSeparator(): (text: string) => string[];
      textSeparator(arg: (text: string) => string[]): EGM;
      vertexButtons(): VertexButton[];
      vertexButtons(arg: VertexButton[]): EGM;
      size(): number[];
      size(arg: number[]): EGM;
      upperStrokeColor(): string;
      upperStrokeColor(arg: string): EGM;

      /**
       * vertex attributes
       */
      vertexColor(): (node: any, u: number) => string;
      vertexColor(arg: (node: any, u: number) => string): EGM;
      vertexFontWeight(): (node: any, u: number) => string;
      vertexFontWeight(arg: (node: any, u: number) => string): EGM;
      vertexOpacity(): (node: any, u: number) => number;
      vertexOpacity(arg: (node: any, u: number) => number): EGM;
      vertexScale(): (node: any, u: number) => number;
      vertexScale(arg: (node: any, u: number) => number): EGM;
      vertexStrokeWidth(): (node: any, u: number) => number;
      vertexStrokeWidth(arg: (node: any, u: number) => number): EGM;
      vertexText(): (node: any, u: number) => string;
      vertexText(arg: (node: any, u: number) => string): EGM;
      vertexVisibility(): (node: any, u: number) => boolean;
      vertexVisibility(arg: (node: any, u: number) => boolean): EGM;

      /**
       * edge attributes
       */
      edgeColor(): (u: number, v: number) => string;
      edgeColor(arg: (u: number, v: number) => string): EGM;
      edgeOpacity(): (u: number, v: number) => number;
      edgeOpacity(arg: (u: number, v: number) => number): EGM;
      edgeText(): (u: number, v: number) => string;
      edgeText(arg: (u: number, v: number) => string): EGM;
      edgeVisibility(): (u: number, v: number) => boolean;
      edgeVisibility(arg: (u: number, v: number) => boolean): EGM;
      edgeWidth(): (u: number, v: number) => number;
      edgeWidth(arg: (u: number, v: number) => number): EGM;

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

    function egm(): EGM;

    module network {
      module centrality {
        function katz(graph: Graph): {[u: number]: number};
      }

      module community {
        function newman(graph: Graph): number[][];
      }
    }
  }
}
