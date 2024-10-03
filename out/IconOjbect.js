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
    constructor(x = 0, // x position in parent coordinate system 
    y = 0, // y position in parent coordinate system 
    w = 42, // initial width (but ignored if reszImg is false)
    h = 13, // initial height (but ignored if reszImg is false)
    urlOrImg, // image, source for image, or no initial image
    reszImg = true, // do we resize the image to our size?
    vis = true) {
        super(x, y, w, h, vis);
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // If true, then we draw the image at our size, otherwise we set our
        // size to match the image size.  
        this._resizesImage = true;
        this._resizesImage = reszImg;
        if (typeof urlOrImg === 'string') {
            // make an arrow function to call our notification callback so it 
            // captures this properly
            const loadNotifyCallback = (evt, img) => {
                this._notifyLoaded(evt, img);
            };
            // start start loading of an image from the URL
            this._image = new DrawableImage(urlOrImg, loadNotifyCallback);
        }
        else if (urlOrImg === undefined) {
            this._image = undefined;
        }
        else { // it's an existing DrawableImage
            this._image = urlOrImg;
        }
    }
    get image() { return this._image; }
    set image(urlOrImg) {
        // make an arrow function to use for our callback, so it is a closure that
        // captures "this" properly
        const loadNotifyCallback = (evt, img) => {
            this._notifyLoaded(evt, img);
        };
        if (typeof urlOrImg === 'string') {
            // only do something on a change
            if (!this._image || this._image.url !== urlOrImg) {
                // damage the old position, then start creation of new image
                this.damageAll();
                this._image = new DrawableImage(urlOrImg, loadNotifyCallback);
            }
        }
        else if (urlOrImg === undefined) {
            // if we had an image and we are being told to drop it, we are damaged
            if (this._image)
                this.damageAll();
            this._image = undefined;
        }
        else { // it's an existing DrawableImage
            // if this not the same image object we are damaged
            if (this._image && this._image !== urlOrImg)
                this.damageAll();
            this._image = urlOrImg;
            // if the image isn't loaded yet, we need to hear about it when it is
            if (!this._image.loaded) {
                this._image.addNotify(loadNotifyCallback);
            }
            else {
                this._resize();
            }
        }
    }
    get resizesImage() { return this._resizesImage; }
    set resizesImage(v) {
        this._resizesImage = v;
        if (!v) {
            this._resize();
        }
    }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // If our size is determined by the image, resize us to match (otherwise do nothing).
    _resize() {
        var _a, _b;
        if ((!this._resizesImage) && this._image) {
            // set to image width and height if defined, else keep original size
            this._w = ((_a = this._image.canvasImage) === null || _a === void 0 ? void 0 : _a.width) || this.w;
            this._h = ((_b = this._image.canvasImage) === null || _b === void 0 ? void 0 : _b.height) || this.h;
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Function that is called when our loading is complete
    _notifyLoaded(evt, img) {
        // we always damage because even the same image object might change internally  
        // damage the old position/size
        this.damageAll();
        this.image = img;
        // do special notification to support possible a extra redraw for 
        // asynchronous notifications that happen after all other drawing 
        // is done.  We only need this because the system is not in a normal
        // event loop and being continuously redrawn
        let top = this._findTop();
        if (top)
            top.asynchnousLoadDamage();
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to draw this object.  
    _drawSelfOnly(ctx) {
        var _a, _b, _c, _d;
        // if we don't have an image bail out
        if (!this.image || !this.image.canvasImage)
            return;
        if (this.resizesImage) { // draw image at our size
            ctx.drawImage(this.image.canvasImage, 0, 0, this.w, this.h);
        }
        else { // draw original image size
            let w = ((_b = (_a = this._image) === null || _a === void 0 ? void 0 : _a.canvasImage) === null || _b === void 0 ? void 0 : _b.width) || this.w;
            let h = ((_d = (_c = this._image) === null || _c === void 0 ? void 0 : _c.canvasImage) === null || _d === void 0 ? void 0 : _d.height) || this.h;
            ctx.drawImage(this.image.canvasImage, 0, 0, w, h);
        }
    }
} // end of IconObject class
//===================================================================
//# sourceMappingURL=IconOjbect.js.map