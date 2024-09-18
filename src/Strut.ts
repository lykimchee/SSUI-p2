import { DrawnObjectBase } from "./DrawnObjectBase.js";
import { SizeConfig, SizeConfigLiteral } from "./SizeConfig.js";

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
    public constructor(w: number = 43, h: number = 45) {

        super(0,0,w,h,true); 

        // configure to be a fixed size
        this._wConfig = SizeConfig.fixed(w);
        this._hConfig = SizeConfig.fixed(h);
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    
    // Override w & h setters so they enforce fixed size
    public override get w() {return super.w;}  
    public override set w(v : number) {
        //=== YOUR CODE HERE ===
    }

    public override get h() {return super.h;}
    public override set h(v : number) {
        //=== YOUR CODE HERE ===
    }


    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Override configuration setters to enforce fixed size
    public override get wConfig() {return super.wConfig;}
    public override set wConfig(v : SizeConfigLiteral) {
        super.wConfig = SizeConfig.fixed(v.nat);
    }

    public override get hConfig() {return super.hConfig;}
    public override set hConfig(v : SizeConfigLiteral) {
        super.hConfig = SizeConfig.fixed(v.nat);
    }

}  // end strut class

//===================================================================

export class Strut_debug extends Strut {
    public constructor(w: number = 43, h: number = 45) {
        super(w,h);
    }

    protected override _drawSelfOnly(ctx: CanvasRenderingContext2D): void { 
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0,0,this.w,this.h);
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(this.w,this.h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(this.w,0); ctx.lineTo(0,this.h); ctx.stroke();
        ctx.restore();
        
        super._drawSelfOnly(ctx); 
    }
}

//===================================================================