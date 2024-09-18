import { DrawContext } from "./Util.js";
import { Err } from "./Err.js";
import { DrawnObjectBase } from "./DrawnObjectBase.js";

//===================================================================
// Class for the object that serves as the root/top of a drawing object tree.
// This object is associated with a particular canvas and sets things
// up so drawing occurs here.  This object also takes care of the various aspects of
// the damage management, layout, and redraw processes that need to happen from the 
// top of the tree.
//
// Note: We are not processing input using a normal input/damage/redraw cycle in this
// project.  Therefore, this class provides some extra methods to deal with that.
// Specifically, to cause layout and drawing after a change, the method 
// layoutAndDrawAll() should be called explicitly after a batch of damage has occured.
// There are also special methods in this class to respond when asynchronous image
// loading completes -- these cause a call to layoutAndDamage() in order to make 
// those images appear correctly.
//===================================================================
export class TopObject extends DrawnObjectBase {
    public constructor(canvasID : string) {
        super(0,0);

        // get the canvas object we will draw on and set our w/h to match that
        this._canvasContext = this._getCanvasContext(canvasID);
        this._owningCanvas  = this._canvasContext.canvas;
        this._w = this._owningCanvas.width;
        this._h = this._owningCanvas.height;
        this._visible = true;

        // cache the drawing context we've seen here for possible use in text measurement 
        // within objects detached from the tree
        DrawnObjectBase._drawContextCache = this._canvasContext;

        // don't respond to asyncronous damage to start with
        this._allowAsyncDamageRedraw = false;

        // set to not damaged to start since we don't have a valid rect for that
        this._damaged = false;

        // now damage our whole extent to get the right damage area and mark us for an
        // initial draw
        this.damageAll();
    }

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------

    // The canvas that we draw on
    protected _owningCanvas : HTMLCanvasElement;
    public get owningCanvas() {return this._owningCanvas;}

    // The drawing context object for the canvas that we draw on
    protected _canvasContext : DrawContext;
    public get canvasContext() {return this._canvasContext;}

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Is this tree currently damaged (something about our layout or display may no
    // longer reflect the state of the objects in the tree)
    protected _damaged : boolean;
    public get damaged() {return this._damaged;}

    // A record of the rectangle that completely covers any areas that have been
    // declared as damaged
    protected _damageRectX : number = 0;
    protected _damageRectY : number = 0;
    protected _damageRectW : number = 0;
    protected _damageRectH : number = 0;

    // Internal flag indicating that an asynchronous image load has caused damage
    // and the next time allowAsyncDamageRedraw has been enabled, we should force
    // a layout and redraw
    protected _haveAsyncDamage : boolean = false;

    // Flag indicating whether asyncronous damage reports (from image loads)
    // should cause an immediate redraw.  We only need this because we are not in
    // a normal event loop, so we don't get the load events in the normal way.
    // Note: This MUST be set false during the the actual layout and redraw process
    // to avoid recursive/reentrant redraws.
    protected _allowAsyncDamageRedraw : boolean = false;
    public get allowAsyncDamageRedraw() { return this._allowAsyncDamageRedraw; }
    public set allowAsyncDamageRedraw(v : boolean) {
        // if there is no change bail out now
        if (v === this._allowAsyncDamageRedraw) return;

        this._allowAsyncDamageRedraw = v;

        // if we are setting this true and we have damage already declared deal with that
        if (v && this._haveAsyncDamage) this.asynchnousLoadDamage();
    }

    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------

    // For this object we clear the canvas behind the children that we draw
    protected override _drawSelfOnly(ctx: CanvasRenderingContext2D): void {
        //=== YOUR CODE HERE ===
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Override the _findTop() method so to returns this object as the top we have been
    // looking for.
    protected override _findTop(): TopObject | undefined {
        return this;
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Method to explicitly invoke layout and redraw of the tree.  In a more typical 
    // system this would be done after each round of input handling.  However, we are 
    // not handling input in this (output-only) project, so this method is provided 
    // instead.  Note that it is still necessary to declare any and all damaged 
    // areas through the normal means, prior to calling this method.
    public layoutAndDrawAll() : void {
        // only do something if we have been damaged since the last redraw
        if (this.damaged) {

            // save the async damage setting so we can restore it
            const saveAsyncSetting = this.allowAsyncDamageRedraw;
            
            // do the layout first...

            // we use a try-catch block here so an exception thrown during layout 
            // doesn't shut down operation of the whole system (unless Err has been
            // configured to do that).  However, in  that case we return without doing 
            // the drawing.

            try {
                // don't do async damage response during layout or drawing
                this.allowAsyncDamageRedraw = false;
                this._performLayout();
            } catch(err) {
                this.allowAsyncDamageRedraw = saveAsyncSetting;
                Err.handle(err, '(During layout)');
                return;
            }

            // layout might have declared damage, but won't be damaged after doing this
            // redraw
            this._damaged = false;

            // we are going to change the drawing context so save it first
            this.canvasContext.save();

            // we do the rest of this in a try-catch block so we can (typically) carry 
            // on if there is an exception thrown somewhere in the draw process. A
            // finally clause is used here to ensure that the restore() that matches 
            // the above save() is always executed irrespective of exceptions.
            try {
                // we don't have a parent to do the following for us, so we do it 
                // ourselves...

                // clip to our bounds
                
                //=== YOUR CODE HERE ===

                // within our bounds clip to just the damaged region
                
                //=== YOUR CODE HERE ===

                // after this we will no longer be damaged, so reset our damage tracking
                // rectangle to be our whole bounds
                this._damageRectX = this._damageRectY = 0;
                this._damageRectW = this.w;
                this._damageRectH = this.h;

                // do the actual drawing from here down the tree
                
                //=== YOUR CODE HERE ===

            } catch(err) {
                // catch any exception thrown and echo the message, but then 
                // use Err to decide how we continue (by default we print a 
                // message to console.log() and carry on).
                Err.handle(err, "(During redraw)")
            } finally {
                // restore() to match the save() that was just above the try block
                this.canvasContext.restore();

                // restore the async damage setting that we set false for this code
                this.allowAsyncDamageRedraw = saveAsyncSetting;
            }

            // if damage has been declared at this point, that was done at some point 
            // during drawing. drawing code should never change things that damage the 
            // drawing becasue that leads to at least repeated, and more likely 
            // infinitely repeated drawing.  so we provide a little warning if that's 
            // happening, as this can be tricky to debug.
            if (this.damaged) {
              console.log("Improper damage declaration during redraw detected " + 
                          "in TopObject.drawAll()");
            }
        }
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Override the routine that declares damage for this object to record the 
    // damage instead of passing it up the tree (since there is no up  from here).
    public override damageArea(xv: number, yv: number, wv: number, hv: number): void {
        //=== YOUR CODE HERE ===
    }
    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .  
    
    // Special routine to declare that damage has occured due to asynchronous
    // image loads.  That damage will have been reported via the normal damage
    // mechanism.  If allowAsynchDamageRedraw is true, this routine will cause
    // a call to layoutAndDrawAll() to force a display refresh that reflects the 
    // newly loaded image.  If allowAsyncDamageRedraw is false, nothing
    // will happen during this call, but this call will be invoked again once that
    // is set back to true
    //
    // This is only needed because we are not in a normal event loop where the event 
    // indicating the load had completed would get handled like any other input.  
    // In this system we aren't necessarily still drawing things when the loads complete, 
    // and this patches that up by doing an extra draw at the point an asynchronous 
    // load completes.
    public asynchnousLoadDamage() { 
        if (!this.allowAsyncDamageRedraw) return;
        
        // clear the record of any asynch damage that was held back
        this._haveAsyncDamage = false;

        // redraw everything that has declared damage
        this.layoutAndDrawAll();
    }
    
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    
    // This method does a two pass layout for the subtree rooted here.
    // It invokes two recursive traversals.  The first is a bottom up traversal which
    // sets the size configuration of every object.  This is done with the 
    // _sizingLaoutPass() method defined in the base class.  After size configurtions
    // have been established the second pass establishes the actual size and position
    // of each object.  This is done with the _completeLayout() method defined in the
    // base class.
    protected _performLayout() : void {
        this._sizingLayoutPass();
        this._completeLayout();
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Utility method to pull out the canvas with the given id and extract 
    // its drawing context (which has a reference back to that canvas in it)
    private _getCanvasContext(canvasID : string) : CanvasRenderingContext2D {
        // type guards to let us deal with HTML objects in a type safe fasion
        function isHTMLCanvasElement(canv : any) : canv is HTMLCanvasElement {
            return (canv && (canv instanceof HTMLCanvasElement));
        }

        function isCanvasRenderingContext2D(ctx : any) : ctx is CanvasRenderingContext2D {
            return (ctx && (ctx instanceof CanvasRenderingContext2D));
        }
    
        // look up the canvas using the ID and validate the result
        const canv = document.getElementById(canvasID);
        if (!canv || !isHTMLCanvasElement(canv))
            throw new Error(`Can't find a canvas element with id:"${canvasID}"`);
        
        // get the drawing context object for the canvas and validate the result
        const ctx = canv.getContext('2d');
        if (!ctx || !isCanvasRenderingContext2D(ctx)) 
            throw new Error(`Can't get rendering context for canvas element with id:"${canvasID}"`);

        return ctx;
    }
} // End of TopObject class

//===================================================================