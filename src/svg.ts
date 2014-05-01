module Svg {
  export module Transform {
    export class Translate {
      constructor(public x : number, public y : number) {
      }

      toString() : string {
        return "translate(" + this.x + "," + this.y + ")";
      }
    }

    export class Scale {
      constructor(public sx : number, public sy : number = undefined) {
      }

      toString() : string {
        if (this.sy) {
          return "scale(" + this.sx + "," + this.sy + ")";
        } else {
          return "scale(" + this.sx + ")";
        }
      }
    }

    export class Rotate {
      constructor(public angle : number) {
      }

      toString() : string {
        return "rotate(" + this.angle + ")";
      }
    }
  }

  export class Point {
    constructor(public x : number, public y : number) {
    }
  }

  export class Rect {
    constructor(
        public x : number, public y : number,
        public width : number, public height : number,
        public theta : number = 0) {
    }


    left() : Point {
      return new Point(
          - this.width / 2 * Math.cos(this.theta) + this.x,
          this.width / 2 * Math.sin(this.theta) + this.y);
    }


    right() : Point {
      return new Point(
          this.width / 2 * Math.cos(this.theta) + this.x,
          this.width / 2 * Math.sin(this.theta) + this.y);
    }


    top() : Point {
      return new Point(
          this.height / 2 * Math.sin(this.theta) + this.x,
          - this.height / 2 * Math.cos(this.theta) + this.y);
    }


    bottom() : Point {
      return new Point(
          this.height / 2 * Math.sin(this.theta) + this.x,
          this.height / 2 * Math.cos(this.theta) + this.y);
    }


    center() : Point {
      return new Point(this.x, this.y);
    }


    static left(x : number, y : number, width : number, height : number, theta : number = 0) : Point {
      return new Point(
          - width / 2 * Math.cos(theta) + x,
          width / 2 * Math.sin(theta) + y);
    }


    static right(x : number, y : number, width : number, height : number, theta : number = 0) : Point {
      return new Point(
          width / 2 * Math.cos(theta) + x,
          width / 2 * Math.sin(theta) + y);
    }


    static top(x : number, y : number, width : number, height : number, theta : number = 0) : Point {
      return new Point(
          height / 2 * Math.sin(theta) + x,
          - height / 2 * Math.cos(theta) + y);
    }


    static bottom(x : number, y : number, width : number, height : number, theta : number = 0) : Point {
      return new Point(
          height / 2 * Math.sin(theta) + x,
          height / 2 * Math.cos(theta) + y);
    }


    static center(x : number, y : number, width : number, height : number, theta : number = 0) : Point {
      return new Point(x, y);
    }
  }


  export class ViewBox {
    constructor(public x : number, public y : number, public width : number, public height : number) {
    }


    toString() : string {
      return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
    }
  }
}
