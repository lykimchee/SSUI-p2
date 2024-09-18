import { DrawContext } from "./Util.js";
import { DrawnObjectBase } from "./DrawnObjectBase.js";
import { DrawableImage } from "./DrawableImage.js";

//===================================================================
// Object that draws an image (AKA icon).  The depending on the value of
// the resizesImage property, the image will be resized to match the size of this 
// object (when resizesImage is true / by default), or this object will be resized to 
// match the image size.  In the second case (resizesImage is false), explicitly 
// resizing this object after construction may end up clipping the image
//===================================================================
export class IconObject extends DrawnObjectBase {
    public constructor(  
        x : number = 0,          // x position in parent coordinate system 
        y: number = 0,           // y position in parent coordinate system 
        w: number = 42,          // initial width (but ignored if reszImg is false)
        h: number = 13,          // initial height (but ignored if reszImg is false)
        urlOrImg? : string | DrawableImage, // image, source for image, or no initial image
        reszImg: boolean = true, // do we resize the image to our size?
        vis: boolean = true)     // initial visibility status
    {
        super(x,y,w,h,vis);

        this._resizesImage = reszImg;

        if (typeof urlOrImg === 'string') {
            // make an arrow function to call our notification callback so it 
            // captures this properly
            const loadNotifyCallback = (evt : Event, img : DrawableImage) : void => {
                this._notifyLoaded(evt,img);
            }
            // start start loading of an image from the URL
            this._image = new DrawableImage(urlOrImg, loadNotifyCallback);
        } else if (urlOrImg === undefined) {
            this._image = undefined;
        } else { // it's an existing DrawableImage
            this._image = urlOrImg;
        }
    }

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------

    // Image that we draw
    protected _image : DrawableImage | undefined; 
    public get image() : DrawableImage | undefined {return this._image;}

    public set image(urlOrImg : string | DrawableImage | undefined) {
        // make an arrow function to use for our callback, so it is a closure that
        // captures "this" properly
        const loadNotifyCallback = (evt : Event, img : DrawableImage) : void => {
            this._notifyLoaded(evt,img);
        }

        if (typeof urlOrImg === 'string') {
            // only do something on a change
            if (!this._image || this._image.url !== urlOrImg) {
                // damage the old position, then start creation of new image
                this.damageAll();
                this._image = new DrawableImage(urlOrImg, loadNotifyCallback); 
            }
        } else if (urlOrImg === undefined) {
            // if we had an image and we are being told to drop it, we are damaged
            if (this._image) this.damageAll();
            this._image = undefined;

        } else { // it's an existing DrawableImage
            // if this not the same image object we are damaged
            if (this._image && this._image !== urlOrImg) this.damageAll();
            this._image = urlOrImg;

            // if the image isn't loaded yet, we need to hear about it when it is
            if (!this._image.loaded) {
                this._image.addNotify(loadNotifyCallback);
            } else {
                this._resize();
            }
        }
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // If true, then we draw the image at our size, otherwise we set our
    // size to match the image size.  
    protected _resizesImage : boolean = true;
    public get resizesImage() {return this._resizesImage;}
    public set resizesImage(v : boolean) {
        //=== YOUR CODE HERE ===
    }

    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    
    // If our size is determined by the image, resize us to match (otherwise do nothing).
    protected _resize() {
        //=== YOUR CODE HERE ===
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Function that is called when our loading is complete
    protected _notifyLoaded(evt : Event, img : DrawableImage) : void {
        // we always damage because even the same image object might change internally  

        // damage the old position/size
        this.damageAll();
        this.image = img;

        // do special notification to support possible a extra redraw for 
        // asynchronous notifications that happen after all other drawing 
        // is done.  We only need this because the system is not in a normal
        // event loop and being continuously redrawn
        let top = this._findTop();
        if (top) top.asynchnousLoadDamage();
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Method to draw this object.  
    protected override _drawSelfOnly(ctx: DrawContext): void {
        // if we don't have an image bail out
        if (!this.image || !this.image.canvasImage) return;

        if (this.resizesImage) {
            //=== YOUR CODE HERE ===
        } else {
            //=== YOUR CODE HERE ===
        }
    }

}  // end of IconObject class

//===================================================================