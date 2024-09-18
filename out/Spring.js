import { DrawnObjectBase } from "./DrawnObjectBase.js";
import { SizeConfig } from "./SizeConfig.js";
//===================================================================
// Class implementing spring objects in a springs and stuts layout.
// These objects are designed to be placed between the content objects
// of a row or column and provide a stretchable or compressable space.
// See the Column class for the complete layout rules.
//
// These objects are fairly simple.  They produce no drawing (but a
// Spring_debug subclass has been provided below to provide a debugging
// display to make these normally invisible objects visible).  Their 
// behavior is implemented by maintaining a fully stretchable size configuration
// (min=0 natural=0 max=infinite).
export class Spring extends DrawnObjectBase {
    constructor() {
        super(0, 0, 0, 0, true);
        // configure to initially be fully elastic
        this._wConfig = SizeConfig.elastic(0);
        this._hConfig = SizeConfig.elastic(0);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Override w & h setters so they enforce elastic size
    get w() { return super.w; }
    set w(v) {
        //=== YOUR CODE HERE ===
    }
    get h() { return super.h; }
    set h(v) {
        //=== YOUR CODE HERE ===
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Override configuration setters to enforce elastic with zero natural size
    get wConfig() { return super.wConfig; }
    set wConfig(v) {
        super.wConfig = SizeConfig.elastic(0);
    }
    get hConfig() { return super.hConfig; }
    set hConfig(v) {
        super.hConfig = SizeConfig.elastic(0);
    }
}
//===================================================================
export class Spring_debug extends Spring {
    // we explicitly declare a size here so we know how to draw 
    constructor(dir) {
        super();
        // we give this a bit of size so the drawing we are doing is not clipped away
        this._direction = dir;
        if (dir === 'w')
            this.h = this.hConfig.nat = 20;
        if (dir === 'h')
            this.w = this.wConfig.nat = 20;
    }
    _drawSelfOnly(ctx) {
        ctx.save();
        // box around the outside
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, this.w, this.h);
        // spring-like lines (depending on direction)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        if (this._direction === 'w') {
            ctx.lineTo(this.w / 3, this.h);
            ctx.lineTo(2 * this.w / 3, 0);
            ctx.lineTo(this.w, this.h);
        }
        else {
            ctx.lineTo(this.w, this.h / 3);
            ctx.lineTo(0, 2 * this.h / 3);
            ctx.lineTo(this.w, this.h);
        }
        ctx.stroke();
        ctx.restore();
        super._drawSelfOnly(ctx);
    }
}
//===================================================================
//# sourceMappingURL=Spring.js.map