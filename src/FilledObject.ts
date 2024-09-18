
import { DrawnObjectBase } from "./DrawnObjectBase.js";
import { SizeConfig, SizeConfigLiteral } from "./SizeConfig.js";

//===================================================================
// A simple rectangular object that just fills its bounding box with a color.
//===================================================================
export class FilledObject extends DrawnObjectBase {

    public constructor(
        x : number = 0, 
        y: number = 0, 
        w: number = 42, 
        h: number = 13,
        color : string | number = 'black') 
    {
        super(x,y,w,h,true); 
        this._color = color;

        // configure to initially be a fixed size
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

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Color that this object fills itself with.  This can be given as a 
    // color name, a string with an HTML style hex number in it for an RGB 
    // value (e.g '#AB42CD'), or an actual number for an RGB value. Beware that 
    // string values are not checked for validity and will silently turn into 'black' 
    // or be ignored if they are not understood by the underlying JavaScript 
    // implementtion.
    protected _color : string | number = 'black';
    public get color() : string | number {return this._color;}
    public set color(v : string | number) {this._color = v;}

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Method to draw the filled rectangle contents for this object
    protected override _drawSelfOnly(ctx: CanvasRenderingContext2D): void {
        if (typeof this._color === 'number') {
            // reformat the number into a string holding an HTML style hex notation number
            ctx.fillStyle = '#' + this.color.toString(16);
        } else {
            ctx.fillStyle = this.color.toString();
        }
        
        //=== YOUR CODE HERE ===
    }

    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Produce a human readable "tag" string for this object -- a short string which 
    // gives basic information about the object.  We override this from the base class
    // to add the fill color to the result since that is likely to help identify it.
    public override tagString() : string {
        return this.constructor.name + '<' + this.debugID + ":'" + this.color + "'" +'>';
    }
}  // end of FilledObject class

//===================================================================