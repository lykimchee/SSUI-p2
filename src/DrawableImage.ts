
//===================================================================
// A class that encapsulates an ansynchronously loaded HTML Image() object 
// (that can be drawn on a canvas) and arranges for loading notification of a sort
// that we will need.
//===================================================================
export class DrawableImage {
    public constructor(url? : string, notifyFun? : (evt:Event, img:DrawableImage)=>void) {
        this._loaded = false;
        this._canvasImage = undefined;
        this._notifyList = [];
        if (notifyFun) this.addNotify(notifyFun);
        if (!url) {
            this._url = undefined;
        } else {
            this._url = url;
            this._startLoad();
        }
    }

    //-------------------------------------------------------------------
    // Properties
    //-------------------------------------------------------------------

    // MISSING_IMAGE is not working yet...
    // URI to provide a "missing/not-yet-loaded" image from in-program data
    // This is a 50x50 generic "this will be an image" icon in PNG format
    public static readonly missingImageURI : string = "";

    // In-memory image that can be used as a stand in for missing/non-yet-loaded images
    // This is a 50x50 pixel image from the data in DrawableImage.missingImageURI
    public static readonly MISSING_IMAGE : HTMLImageElement = new Image(50,50)
    static {this.MISSING_IMAGE.src = DrawableImage.missingImageURI;}

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // URL where we retrieve the image contents from. Can be undefined to denote 
    // "no image".
    protected _url : string | undefined;
    public get url() : string | undefined {return this._url;}

    // Note any load callback functions need to be added before this function is 
    // called / property set.
    public set url(v : string) {
        if (v !== this._url) {
            this._url = v;
            this._startLoad();
        }
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // The underlying HTML image object.  This may not be functional prior 
    // to loading of the image (i.e., when this object is marked as not loaded)
    protected _canvasImage : HTMLImageElement | undefined;
    public get canvasImage() : HTMLImageElement | undefined {return this._canvasImage}

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    
    // Is the image loaded yet?  If this is false, the canvasImage may not be 
    // available, or may not work properly.  However, notification functions can 
    // be safely added.
    protected _loaded : boolean = false;
    public get loaded() : boolean {return this._loaded;}

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // List of the notification functions we are to call once this image is loaded.
    protected _notifyList : ((evt:Event, img:DrawableImage)=>void)[] = [];

    // Add a notification function to be called once this image is loaded.
    // If this image is marked as already loaded, this does nothing (and so
    // the given notification function will not be called after the next load).
    public addNotify(notifyFun : (evt:Event, img:DrawableImage)=>void) : void {
        if (!this._loaded) this._notifyList.push(notifyFun);
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
    protected _startLoad() : void {
        this._loaded = false;
        
        // only try to load if we have something to possibily load
        if (this.url) {
            // create an image object 
            this._canvasImage = new Image();

            // set up the load completion callback
            this._canvasImage.onload = (evt: Event): void => {
                this._loaded = true;
                for (let notif of this._notifyList) {
                    notif(evt, this);
                }  
                // once a notification fires, don't fire it again
                this._notifyList = []; 
            }

            // tell the Image object where to get it's image from
            this._canvasImage.src = this.url;
        }
    }

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Force this object to reload it's context (from the same URL)
    public reload(notifyFun? : (evt:Event)=>void) : void {
        this._loaded = false;
        if (notifyFun) this.addNotify(notifyFun);
        this._startLoad();
    }
} // end DrawableImage class

//===================================================================