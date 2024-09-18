import { DrawnObjectBase } from "./DrawnObjectBase.js";
import { SizeConfig } from "./SizeConfig.js";
//===================================================================
// Class implementing strut objects in a springs and struts layout.
// See the Column class for the details of how that layout works.
// These objects are designed to be placed between content objects
// of a row or column to provide spacing that is fixed and not stretchable
// or compressable.  These objects are simple fixed size objects 
// (with a min = max = natural size) that produce no drawing output.
// For debugging purposes a Strut_debug class is provided below that 
// produces some display that can help one understand how the layout is
// working.
//===================================================================
export class Strut extends DrawnObjectBase {
    constructor(w = 43, h = 45) {
        super(0, 0, w, h, true);
        // configure to be a fixed size
        this._wConfig = SizeConfig.fixed(w);
        this._hConfig = SizeConfig.fixed(h);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Override w & h setters so they enforce fixed size
    get w() { return super.w; }
    set w(v) {
        //=== YOUR CODE HERE ===
    }
    get h() { return super.h; }
    set h(v) {
        //=== YOUR CODE HERE ===
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Override configuration setters to enforce fixed size
    get wConfig() { return super.wConfig; }
    set wConfig(v) {
        super.wConfig = SizeConfig.fixed(v.nat);
    }
    get hConfig() { return super.hConfig; }
    set hConfig(v) {
        super.hConfig = SizeConfig.fixed(v.nat);
    }
} // end strut class
//===================================================================
export class Strut_debug extends Strut {
    constructor(w = 43, h = 45) {
        super(w, h);
    }
    _drawSelfOnly(ctx) {
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, this.w, this.h);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.w, this.h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.w, 0);
        ctx.lineTo(0, this.h);
        ctx.stroke();
        ctx.restore();
        super._drawSelfOnly(ctx);
    }
}
//===================================================================
//# sourceMappingURL=Strut.js.map