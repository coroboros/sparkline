declare module 'svg-parser' {
  export type SvgNode = {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children: SvgNode[];
    value?: string;
  };

  export type SvgRoot = {
    type: 'root';
    children: SvgNode[];
  };

  export function parse(source: string): SvgRoot;
}
