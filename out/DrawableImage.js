var _a;
//===================================================================
// A class that encapsulates an ansynchronously loaded HTML Image() object 
// (that can be drawn on a canvas) and arranges for loading notification of a sort
// that we will need.
//===================================================================
export class DrawableImage {
    constructor(url, notifyFun) {
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Is the image loaded yet?  If this is false, the canvasImage may not be 
        // available, or may not work properly.  However, notification functions can 
        // be safely added.
        this._loaded = false;
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // List of the notification functions we are to call once this image is loaded.
        this._notifyList = [];
        this._loaded = false;
        // this._canvasImage = undefined;
        this._canvasImage = undefined;
        this._notifyList = [];
        if (notifyFun)
            this.addNotify(notifyFun);
        if (!url) {
            this._url = undefined;
        }
        else {
            this._url = url;
            this._startLoad();
        }
    }
    get url() { return this._url; }
    // Note any load callback functions need to be added before this function is 
    // called / property set.
    set url(v) {
        if (v !== this._url) {
            this._url = v;
            this._startLoad();
        }
    }
    get canvasImage() { return this._canvasImage; }
    get loaded() { return this._loaded; }
    // Add a notification function to be called once this image is loaded.
    // If this image is marked as already loaded, this does nothing (and so
    // the given notification function will not be called after the next load).
    addNotify(notifyFun) {
        if (!this._loaded)
            this._notifyList.push(notifyFun);
    }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Start loading the image that this object encapsulates.  This assumes that
    // that the URL to load from has been established and callback functions for 
    // load notification have all been added to the notification list When loading 
    // is completed, all the notification functions on the list will be called with 
    // the event from the load and a pointer to this object.  Currently, If the load 
    // fails that happens silently: the load notification callbacks are not called 
    // but no failure notification is provided either.
    _startLoad() {
        this._loaded = false;
        // only try to load if we have something to possibily load
        if (this.url) {
            // create an image object 
            this._canvasImage = new Image();
            // set up the load completion callback
            this._canvasImage.onload = (evt) => {
                this._loaded = true;
                for (let notif of this._notifyList) {
                    notif(evt, this);
                }
                // once a notification fires, don't fire it again
                this._notifyList = [];
            };
            // tell the Image object where to get it's image from
            this._canvasImage.src = this.url;
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Force this object to reload it's context (from the same URL)
    reload(notifyFun) {
        this._loaded = false;
        if (notifyFun)
            this.addNotify(notifyFun);
        this._startLoad();
    }
} // end DrawableImage class
_a = DrawableImage;
//-------------------------------------------------------------------
// Properties
//-------------------------------------------------------------------
//xx MISSING_IMAGE is not working yet...
// URI to provide a "missing/not-yet-loaded" image from in-program data
// This is a 50x50 generic "this will be an image" icon in PNG format
DrawableImage.missingImageURI = "data:image/png;base64," +
    "iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAAXNSR0IArs4c6QAAAAR" +
    "nQU1BAACxjwv8YQUAAACuUExURf////Hx8djY2NnZ2erq6ufn57m5uby8vNzc3Ojo6L" +
    "+/v729vd3d3cHBwdDQ0NHR0cPDw76+vsbGxvv7+8/Pz87Ozvr6+v7+/vj4+NPT083Nz" +
    "fLy8tXV1bq6uru7u8rKyvz8/PX19cfHx/b29uLi4snJyePj48vLy9LS0szMzPT09O/v" +
    "7/Pz8/n5+dbW1v39/cLCwvf39+Hh4e7u7uvr68jIyMDAwO3t7eDg4Ozs7O1LNxkAAAA" +
    "JcEhZcwAADsMAAA7DAcdvqGQAAAFTSURBVEhL7ZVrV4JAEIY3I6d2FVk1V0lTo6wor9" +
    "Ht//+xZpb1ZMIA9aXOyeeDjMv7nGGXBcQBIY5qxxWoeS5OnNShAvVTFyfOQEpVgpTQc" +
    "HEClabfKibQe4pud1zN0VXfVs5/WemZ9JiBU/qDILywQxk4ZTjSl+OJHUuZ9l3BKZMr" +
    "LaWM0kHChNeuKuoCNztdZqPb7dzYudwF9ztziZtaPbiaU7Yr9jinX+ODhAVVCK9YluO" +
    "Q/s5wt+rVOh0rUTYA3Y6IV7QY4BaAVQxd1xSz4M9b2AQfivHSnmEVb4HOgLKqTQIVT/" +
    "YMp5iwvhAePk4IXRUBQ5vhlERJGDxvwyluARjFhNhAfTWwzYYyjJKAzkHZ/ZCvGF828" +
    "3h5xQyjROtcoh5muOkXkKOkN4wn+4ZZNd6Kae+/x3ApS8A9tK+Uc1A++bPKDz6v/eS9" +
    "Ans4v8YIT4AIHBHOdb9iJIAAAAASUVORK5CYII=";
// In-memory image that can be used as a stand in for missing/non-yet-loaded images
// This is a 50x50 pixel image from the data in DrawableImage.missingImageURI
DrawableImage.MISSING_IMAGE = new Image(50, 50);
(() => {
    _a.MISSING_IMAGE.src = _a.missingImageURI;
})();
//===================================================================
//# sourceMappingURL=DrawableImage.js.map