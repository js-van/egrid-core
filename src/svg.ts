module egrid.svg.transform {
export interface Transform {
  toString(): string;
}


export class Translate implements Transform {
  constructor(private tx: number, private ty: number) {
  }

  toString(): string {
    return 'translate(' + this.tx + ',' + this.ty + ')';
  }
}


export class Scale implements Transform {
  constructor(private sx: number, private sy: number) {
  }

  toString(): string {
    return 'scale(' + this.sx + ',' + this.sy + ')';
  }
}


export function translate(tx: number, ty: number = 0): Translate {
  return new Translate(tx, ty);
}


export function scale(sx: number, sy: number = sx) {
  return new Scale(sx, sy);
}


export function compose(...transforms: Transform[]): string {
  return transforms.map(transform => transform.toString()).join('');
}
}
