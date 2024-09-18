import { DrawnObjectBase } from "./DrawnObjectBase.js";
//===================================================================
// A simple container object for grouping a set of child objects together.
// This does not produce any output, and does not size, position, or otherwise
// modify it's child objects at all.  It simply draws its children (clipped to
// it's bounding box.)  This turns out to not require anything beyond the 
// base class, but we introduce this class for clarity of naming anyway.
//===================================================================
export class Group extends DrawnObjectBase {
    constructor(x = 0, // x position in parent coordinate system 
    y = 0, // y position in parent coordinate system 
    w = 42, // initial width
    h = 13, // initial height
    vis = true) {
        super(x, y, w, h, vis);
    }
}
//# sourceMappingURL=Group.js.map