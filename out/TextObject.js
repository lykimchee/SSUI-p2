import { DrawnObjectBase } from "./DrawnObjectBase.js";
import { SizeConfig } from "./SizeConfig.js";
//===================================================================
// Object that displays a single text string on one line
//===================================================================
export class TextObject extends DrawnObjectBase {
    constructor(x, y, text = "", font = TextObject.DEFAULT_FONT, padding = 0, color = 'black', renderType = 'fill') {
        super(x, y);
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Color used for drawing.  This can be given as a color name, a string with an HTML 
        // style hex number in it for an RGB value (e.g '#AB42CD'), or an actual number for 
        // an RGB value. Beware that string values are not checked for validity and will 
        // silently turn into 'black' or be ignored if they are not understood by the 
        // underlying JavaScript implementation.
        this._color = 'black';
        this._text = text;
        this._font = font;
        if (typeof padding === 'number')
            padding = { w: padding, h: padding };
        this._padding = padding;
        this._color = color;
        this._renderType = renderType;
        this._recalcSize();
    }
    get text() { return this._text; }
    set text(v) {
        //=== YOUR CODE HERE ===
    }
    get font() { return this._font; }
    set font(v) {
        //=== YOUR CODE HERE ===
    }
    get padding() { return this._padding; }
    set padding(v) {
        if (typeof v === 'number')
            v = { w: v, h: v };
        //=== YOUR CODE HERE ===
    }
    get renderType() { return this._renderType; }
    set rederType(v) { this._renderType = v; }
    get color() { return this._color; }
    set color(v) { this._color = v; }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Recalculate the size of this object based on the size of the text
    _recalcSize(ctx) {
        //=== YOUR CODE HERE ===
        // set the size configuration to be fixed at that size
        this.wConfig = SizeConfig.fixed(this.w);
        this.hConfig = SizeConfig.fixed(this.h);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to draw this object.  Note that we are only handling left-to-right
    // alphabetic (Latin) baseline text properly for this object.
    _drawSelfOnly(ctx) {
        // we are going to be changing the drawing context but don't want that to 
        // propagate, so we save and restore it's state.  we will do the rest of the 
        // work in a try-finally block so we are sure the restore happens.
        ctx.save();
        try {
            // work out the color in string form 
            let clr;
            if (typeof this._color === 'number') {
                // reformat  number into a string holding  HTML style hex notation number
                clr = '#' + this.color.toString(16);
            }
            else {
                clr = this.color.toString();
            }
            //=== YOUR CODE HERE ===
        }
        finally {
            // restore the drawing context to the state it was given to us in
            ctx.restore();
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a human readable "tag" string for this object -- a short string which 
    // gives basic information about the object.  We override this from the base class
    // to add the a few characters of the text to the result since that is likely to 
    // help identify the object.
    tagString() {
        const TXT_TAG_LEN = 4;
        return this.constructor.name + '<' + this.debugID +
            ':"' + this.text.substring(0, TXT_TAG_LEN) + '"' + '>';
    }
} // end of TextObject class
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
// Default font that we use for objects of this class.  We use "em" sizing here
// in order to pick up the current default sized being used for the canvas and
// likely inherited from the browser (and a multiple of 1em because that default 
// seems to typically be fairly small).
TextObject.DEFAULT_FONT = "1.5em sans-serif";
//===================================================================
// A slightly extended TextObject class which adds some output helpful 
// for debugging.  In particular this class will draw a background showing
// the bounding box and a line for the text baseline (both behind the normal 
// text output).
//===================================================================
export class TextObject_debug extends TextObject {
    constructor(x, y, text = "", font = TextObject.DEFAULT_FONT, padding = { w: 0, h: 0 }, color = 'black', renderType = 'fill') {
        super(x, y, text, font, padding, color, renderType);
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // color we draw the background in
        this.debugColor = 'silver';
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
    // Method to draw this object.  Here we fill out extent and draw a line for the
    // baseline of the text, then let the superclass draw the actual text over that.
    _drawSelfOnly(ctx) {
        // we are going to be changing the drawing context but don't want that to 
        // propagate, so we save and restore it's state.  we will do the rest of the 
        // work in a try-finally block so we are sure the restore happens.
        ctx.save();
        try {
            ctx.fillStyle = this.debugColor;
            ctx.fillRect(0, 0, this.w, this.h);
            // apply our font & force text drawing to be done in the form we are expecting
            ctx.font = this.font;
            ctx.textBaseline = 'alphabetic'; // alphabetic baseline text only
            ctx.direction = 'ltr'; // handling left-to-right text only
            ctx.textAlign = 'left';
            // measure our text in order to get the baseline position
            const meas = this._measureText(this.text, this.font, ctx);
            ctx.beginPath();
            ctx.strokeStyle = (this.debugColor !== 'black') ? 'black' : 'white';
            ctx.moveTo(0, meas.baseln);
            ctx.lineTo(this.w, meas.baseln);
            ctx.stroke();
            ctx.beginPath();
            // the super class does the the regular drawing over the top
            super._drawSelfOnly(ctx);
        }
        finally {
            // restore the drawing context to the state it was given to us in
            ctx.restore();
        }
    }
}
//===================================================================
//# sourceMappingURL=TextObject.js.map