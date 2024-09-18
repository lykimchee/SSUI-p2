import {DrawnObjectBase} from "./DrawnObjectBase.js";

//===================================================================
// A simple container object for grouping a set of child objects together.
// This does not produce any output, and does not size, position, or otherwise
// modify it's child objects at all.  It simply draws its children (clipped to
// it's bounding box.)  This turns out to not require anything beyond the 
// base class, but we introduce this class for clarity of naming anyway.
//===================================================================

export class Group extends DrawnObjectBase {
    public constructor(  
        x : number = 0,      // x position in parent coordinate system 
        y: number = 0,       // y position in parent coordinate system 
        w: number = 42,      // initial width
        h: number = 13,      // initial height
        vis: boolean = true) // initial visibility status
    {
        super(x,y,w,h,vis);
    }
}