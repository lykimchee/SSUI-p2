
//===================================================================
// Utility types and function that are used across modules
//===================================================================

//-------------------------------------------------------------------
// Simple (non-class) types
//-------------------------------------------------------------------

// Rename of drawing context so we can put a wrapper around it later
export type DrawContext = CanvasRenderingContext2D; 

// Some useful object literal types for passing and return related groups of values
export type PointLiteral = {x: number, y: number};
export type SizeLiteral = {w: number, h: number};
// export type SizeConfigLiteral = {nat: number, min: number, max: number};

// Literal for simple text measurement.  The baseln value here is the 
// distance from the top of the bounding box for the text to the baseline.
export type TextMeasure = {w : number, h : number, baseln: number};

// Some useful limited value string types for various settings and operations
export type RenderOp = 'fill' | 'stroke';
export type WJust = 'right'| 'center' |  'left';
export type HJust = 'top' | 'center' | 'bottom';

//-------------------------------------------------------------------
// Utility functions
//-------------------------------------------------------------------

// none currently...
