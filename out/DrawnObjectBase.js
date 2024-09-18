//===================================================================
// Base class for objects for hierarchically drawn objects v1.0a 9/23
// by Scott Hudson, CMU HCII 
// 
// This class is the central base class for SSUI project #2.  It provides  the basic 
// operations for a hieractical collection of objects which can draw output in an HTML
// canvas (i.e., simple output-only interactors).  Useful objects of this sort
// will all be subclasses of this base class.  
//
// For this project you are being ask to provide some of the implementation of this
// class along with a number of subclasses.
//
// This class provides implementtion or partial implementation in six categories:
//   * Constructor, properties, and property accessors.  
//   * A child list and parent "back pointer" to implement the tree establishing 
//     drawing hierarchy; along with methods for adding and removing children.
//   * Methods for hierachical drawing.
//   * Methods implementing layout (size and positioning) for objects.
//   * Methods for tracking damage (areas which need to be redrawn)
//   * Some debugging aids which e.g., provide human-readable strings useful for
//     displaying objects in textual debugging output.
// 
// PROPERTIES
// Key properties include those that determine the current size and position of the 
// object (x,y, w,h); size configuration information that determine the sizing 
// capabilities of this object (minimum, natural, and maximum width and hieght: 
// wConfig, hConfig); and whether the object is currently visible (visible).  All 
// properties use protected storage (declared in "_name" form), along with get and/or
// set accessors (declared with a "plain" name), and in some cases additional accessors
// which break out parts of a value or set related values together.
//
// DRAWING
// Objects are drawn using a hierarchical coordinate system.  Each object is placed
// at some x,y position within it's parent's coordinate system, then esstablishes it's
// own local coordinate system with it's top-left forming the origin (with the y-axis
// pointing down on the screen).  Each object also maintains a width and height, which 
// along with its position establishes a bounding box of the object.  All drawing output
// for the object and all of its children are clipped to that bounding box.  
//
// LAYOUT
// Layout is done in a two-pass fashion -- first bottom up to determine available size
// ranges, then a top down pass establishing final size and position of each objects.
// Objects use width and hieght configuration objects (wConfig, hConfig) to express the
// set of sizes they are capable of taking on.  Each of the configurations expresses a 
// minimum, natural, or desired, and maximum size for the object.  For simple objects,
// these values are typically determined by the contents of the object.  For example,
// a TextObject has a fixed size (min=natural=max) which is determined by the text it 
// draws (along with its font, etc.). Layout containers will use the size configuration 
// information of their children to determine their own size configuration, and will in 
// the second pass of the layout implementation estabish the actual size and position 
// of each of their children.  
//
// DAMAGE MANAGEMENT
// Each time something about an object changes in a way that should be reflected by a 
// visual image for the object, it must declare "damage" indicating what part of its 
// display may need to be udpated (by calling damageArea()) or that it's full display 
// might need to be updated (by calling damageAll()).  Note that it is safe to 
// declare more damaged area that could actually change, so it is allways safe to
// call damageAll() (and most code defaults to doing that rather than working out 
// the exact area of damage).
//
// History of major versions
//  V1.0a   Initial version   Scott Hudson 9/23
//
//===================================================================
import { SizeConfig } from "./SizeConfig.js";
// used here to get a drawing context to measure text with
export class DrawnObjectBase {
    //-------------------------------------------------------------------
    constructor(x = 0, // x position in parent coordinate system 
    y = 0, // y position in parent coordinate system 
    w = 42, // initial width
    h = 13, // initial height
    vis = true) {
        //-------------------------------------------------------------------
        // Properties
        //-------------------------------------------------------------------
        // A note about overriding getter and setter properties: 
        // If either setter or getter is overriden in a subclass, normally both 
        // must be overriden, otherwise the non-overridden one will be treated 
        // as missing (not inherited the from the base class as one might expect). 
        // Uses of a getter of this form will not cause a compile time error, but will 
        // return undefined at runtime.  (This is apparently part of the language spec.)
        // Property for x position of this object in parent coordinates
        this._x = 0;
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Property for y position of this object in parent coordinates
        this._y = 0;
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Property for the width of this object
        this._w = 42;
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Properties for the width configuration
        this._wConfig = SizeConfig.elastic(42);
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Properties for the height of this object
        this._h = 13;
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Properties for the height configuration 
        this._hConfig = SizeConfig.elastic(13);
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Property indicating if this object is visible (is to be drawn).
        // Note that the object retains its size and position while invisible, and
        // it may affect layout, etc.
        this._visible = true;
        //-------------------------------------------------------------------
        // Child list maintenance 
        //-------------------------------------------------------------------
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Bookkeeping for link back to the parent
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Property indicating the parent object of this object.  If this object is 
        // not installed in the interactor tree this will be undefined.  Changing the parent
        // directly is not allowed (outside actions of the class itself).  Instead
        // use one of the child list manipulation functions: addChild(), etc.
        this._parent = undefined;
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // Bookkeeping and manipulation for the child list itself
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // List of child objects of this object.  Note that the get accessor for this property
        // only provides readonly (immutable) access to the child list.  Adding or removing
        // elements needs to be done with the additional methods for that purpose.
        this._children = [];
        this._x = x;
        this._y = y;
        this._w = w;
        this._h = h;
        this._visible = vis;
        this._debugID = DrawnObjectBase._genDebugID();
        // by default we configure with the given size as natural size 
        // and fully stretchable
        this._wConfig = SizeConfig.elastic(w);
        this._hConfig = SizeConfig.elastic(h);
    }
    get x() { return this._x; }
    set x(v) {
        if (v !== this.x) {
            // don't forget to declare damage whenever something changes
            // that could affect the display
            //=== YOUR CODE HERE ===
        }
    }
    get y() { return this._y; }
    set y(v) {
        //=== YOUR CODE HERE ===
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // x,y position of this object in parent coordinates 
    get position() { return { x: this.x, y: this.y }; }
    set position(v) {
        let { x: newX, y: newY } = v;
        this.x = newX;
        this.y = newY;
    }
    get w() { return this._w; }
    set w(v) {
        //=== YOUR CODE HERE ===
    }
    get wConfig() { return this._wConfig; }
    set wConfig(v) {
        //=== YOUR CODE HERE ===
    }
    get naturalW() { return this._wConfig.nat; }
    set naturalW(v) {
        this.wConfig = { nat: v, min: this.minW, max: this.maxW };
    }
    get minW() { return this._wConfig.min; }
    set minW(v) {
        this.wConfig = { nat: this.naturalW, min: v, max: this.maxW };
    }
    get maxW() { return this._wConfig.max; }
    set maxW(v) {
        this.wConfig = { nat: this.naturalW, min: this.minW, max: v };
    }
    // Indicate whether this object's width is fixed (min === max so not resizable)
    wIsFixed() { return this._wConfig.min === this._wConfig.max; }
    get h() { return this._h; }
    set h(v) {
        //=== YOUR CODE HERE ===
    }
    get hConfig() { return this._hConfig; }
    set hConfig(v) {
        //=== YOUR CODE HERE ===
    }
    get naturalH() { return this._hConfig.nat; }
    set naturalH(v) {
        this.hConfig = { nat: v, min: this.minH, max: this.maxH };
    }
    get minH() { return this._hConfig.min; }
    set minH(v) {
        this.hConfig = { nat: this.naturalH, min: v, max: this.maxH };
    }
    get maxH() { return this._hConfig.max; }
    set maxH(v) {
        this.hConfig = { nat: this.naturalH, min: this.minH, max: v };
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Accessors for handling the size of this object as a single value
    get size() { return { w: this.w, h: this.h }; }
    set size(v) {
        let { w: newW, h: newH } = v;
        this.w = newW;
        this.h = newH;
    }
    get visible() { return this._visible; }
    set visible(v) {
        //=== YOUR CODE HERE ===
    }
    get parent() { return this._parent; }
    // Find the root display object at the top of the tree this object is installed in.
    // If there is no such root, because this object or one of it's ancestors is 
    // detached from the tree, undefined is returned.
    _findTop() {
        if (this._parent === undefined) {
            return undefined;
        }
        else {
            return this._parent._findTop();
        }
    }
    // Access to setting the raw _parent value for use by internal child manipulation 
    // routines.  Note that this method does not include any declaration of damage.  
    // That is done in various child manipulation routines that call this method.
    // This method (which here in the base class just does a simple assignment
    // to _parent) exists because some sub-classes may need to do extra bookkeeping when 
    // the parent is changed, and they can override this method to insert that.  
    // (There is not a good way to enforce this, but...) obviously all writes to the 
    // _parent property should be done via this method instead of a raw assignment.
    _setParent(newParent) {
        this._parent = newParent;
    }
    // detach this object from the tree (declaring damage and maintaining child list
    // bookkeeping as needed).
    detachFromTree() {
        if (this.parent)
            this.parent.detachChild(this);
    }
    get children() { return this._children; }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Find and return the index of the given child object in our child list 
    // (or -1 if it is not found).
    findChild(child) {
        return this.children.indexOf(child);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Remove the child at the given index within this object's child list.  This
    // closes the resulting gap in the child list (i.e., the indexes of all the 
    // siblings after it are reduced by 1), and returns the removed child (or undefined
    //  if the index provided was out of bounds, or the subclass disallows removing that 
    // child).  This removes the given child object from the overall tree.
    // This method takes care of declaring damage at the child object's previous
    // location in the tree and maintaining all child list bookkeeping.
    detachChildAt(indx) {
        if (indx < 0 || indx >= this.children.length)
            return undefined;
        const child = this.children[indx];
        if (child.visible)
            child.damageAll();
        this._children.splice(indx, 1);
        child._setParent(undefined);
        return child;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Remove the given child within this object's child list. this finds and 
    // removes the child within this object's child list, closes the resulting gap 
    // in the child list (i.e., the indexes of all the siblings after it are 
    // reduced by 1), and returns a boolean indicating if the removal was successful 
    // (i.e., the child was found in the child list and removal of the child was not
    // forbidden by the subclass).  This removes the given child object from the 
    // overall tree and maintains all child list bookkeeping.
    detachChild(child) {
        const indx = this.findChild(child);
        if (indx === -1)
            return false;
        return this.detachChildAt(indx) ? true : false;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 
    // Add the given child to the children of this object at the given index in the 
    // child list.  This "moves down" all children after that index.  Indexes which 
    // are out of bounds will be silently adjusted to be in bounds.  If the index is 
    // not provided, the child is added to the end of the child list.  When a child 
    // is added, it will first be removed from its current parent (if any).
    addChildAt(newChild, indx = this.children.length) {
        if (indx > this.children.length)
            indx = this.children.length;
        if (indx < 0)
            indx = 0;
        if (newChild.parent)
            newChild.parent.detachChild(newChild);
        newChild._setParent(this);
        this._children.splice(indx, 0, newChild);
        return this;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Add the given child the end of the child list
    addChild(newChild) {
        return this.addChildAt(newChild);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Add the given new child after the given sibling object.  If the indicated
    // sibling object is not actually in the child list, nothing happens. When a child 
    // is added, it will first be removed from its current parent (if any).
    addChildAfter(afterSibling, newChild) {
        const siblingIndx = this.findChild(afterSibling);
        if (siblingIndx >= 0)
            this.addChildAt(newChild, siblingIndx + 1);
        return this;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Add the given new child before the given sibling object.  If the indicated
    // sibling object is not actually in the child list, nothing happens. When a child 
    // is added, it will first be removed from its current parent (if any).
    addChildBefore(beforeSibling, newChild) {
        const siblingIndx = this.findChild(beforeSibling);
        if (siblingIndx >= 0)
            this.addChildAt(newChild, siblingIndx);
        return this;
    }
    //-------------------------------------------------------------------
    // Layout related
    //-------------------------------------------------------------------
    // Do the first pass for layout: a bottom up determination of the sizing 
    // configuration of each object.  This methods does (or continues) a recursive
    // traversal which first sizes the tree below this node (recursively),
    // then configures the size of this object (with _doLocalSizing()).  Normally 
    // this method does not need to be overriden, only _doLocalSizing().
    _sizingLayoutPass() {
        // this is bottom up so we do the recursive part first then the local part
        for (let child of this.children)
            child._sizingLayoutPass();
        this._doLocalSizing();
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Do the size configurtion for this object assuming that the size configuration
    // of each child object is up to date.  In general, for simple objects sizing should 
    // be done based on what the object is (and the requirements/abilities that 
    // indicates).  Layout objects should do sizing on the basis of the sizing 
    // configuration of their children, as well as any local information that affects
    // their layout.  
    //
    // Here in the base class we don't do any layout of our children, so we just
    // set our natural sizes to match our actual size and leave our min and max
    // as previously configured.  
    _doLocalSizing() {
        this.wConfig.nat = this.w;
        this.hConfig.nat = this.h;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Do the local portion of the second (top down) pass which finalizes the layout of 
    // the subtrees under this object.  This assumes that the sizing configuration of all 
    // objects has already been done in a prior pass, and that our parent has completed 
    // its layout.  Our parent normally will have set the size and position of this 
    // object, and normally the size and position of this object should be left alone 
    // here.  However, in cases where e.g., sizing constraints absolutely must be 
    // enforced, that can be done here (although that can break the layout, so needs to 
    // be done with care).  The primary job of this method is to set the final size and 
    // position of the immediate children of this object.
    //
    // Here in we will do a "floating" layout (essentially no layout at all) where 
    // each child just ends up with whatever size and position has been set for it
    // elsewhere.  
    _completeLocalLayout() {
        // here in the base class we don't do layout of children, so we do nothing
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Do (or continue) the second (top down) recursive pass to finalize the size and 
    // position of each object. This assumes that the sizing configurations of 
    // each object in the tree is up to date (i.e., that the bottom up pass done by 
    // _sizingLayoutPass() has just be done), and that our parent has done the 
    // sizing and positioning of this object.  This methods uses _completeLocalLayout()
    // to do layout of our children, then recurses to continue the layout.  Normally, 
    // this method does not need to be overriden, only _completeLocalLayout().
    _completeLayout() {
        this._completeLocalLayout();
        for (let child of this.children)
            child._completeLayout();
    }
    //-------------------------------------------------------------------
    // Drawing related
    //-------------------------------------------------------------------
    // Utility routine to apply a clipping rectangle to the given drawing context.
    // This reduces the cippping area to the intersection of any existing clipping
    // area and the given rectangle.
    applyClip(ctx, clipx, clipy, clipw, cliph) {
        //=== YOUR CODE HERE ===
    }
    // Utility routine to create a new rectangular path at our bounding box.
    makeBoundingBoxPath(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.w, 0);
        ctx.lineTo(this.w, this.h);
        ctx.lineTo(0, this.h);
        ctx.lineTo(0, 0);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // This method should (if this object is marked as visible) draw the display for this 
    // object and all of its children, using the given drawing context object.
    // The context object passed in here should have been adjusted so that drawing is 
    // occuring in the local coordinate system of this object (i.e., something at 0,0 
    // here should appear at the location corresponding to this.x,this.y in the parent 
    // coordinate system), and is clipped to the bounding box of this object.  Any color, 
    // line style, font, etc. settings already set in the context object will be used in 
    // the drawing here.  (Since the parent object calling this routine is in general 
    // unknown, it is generally not a good idea to rely on those values, so any values
    // affecting the drawing should most typically be reset to desired values before 
    // use.)  Any changes to the context object setting will be reverted after this 
    // drawing is complete. This means that changes in one sibling in a child list will 
    // not be passed on to the next sibling being drawn.  It is important that the 
    // save()/restore() stack encapsulated within the context object be preserved in 
    // all circumstances.  That is: for each save() call, there must be a matching 
    // restore() call made after it, and there may not be any extra restore() calls.
    // 
    // Here in the base class drawing is done by first calling _drawSelfOnly() to draw 
    // the "local" contents of this object, then calling _drawChildren() to draw our 
    // child objects.  This results in a default behavior of drawing the children on 
    // top of the all the drawing for this object.  If more complex drawing (including 
    // drawing between or over children) is desired, this method should be overridden.
    draw(ctx) {
        if (this.visible) {
            this._drawSelfOnly(ctx);
            this._drawChildren(ctx);
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Draw the contents of this object.  Note that any changes to the context object 
    // will by default be reflected in the child drawing since the same drawing context 
    // object is used.
    _drawSelfOnly(ctx) {
        // here in the base class we draw a bunch of nothing...
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Internal method to do the setup on the given drawing context object needed 
    // to draw the child at the given index.  This needs to (at least): 
    // 1) save full the current state of the context object (so it can be restored 
    //    in _endChildDraw()).  
    // 2) apply a translation tranformation to move to the child's corrdinate system.
    // 3) reduce the clipping region of the context object so it does not include 
    //    any area outside the child's bounding box.
    _startChildDraw(childIndx, ctx) {
        // save the state of the context object on its internal stack
        ctx.save();
        //=== YOUR CODE HERE ===
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Internal method to restore the given drawing context after drawing the 
    // child object at the given index.  This needs to at least restore the 
    // context object to the state it was before the corresponding call to 
    // _startChildDraw().
    _endChildDraw(childIndx, ctx) {
        // restore the state of the context object from its internal stack
        // this will undo clipping and coordinate system changes
        ctx.restore();
    }
    // Draw all the children of this object.  For each child object, this calls 
    // _startChildDraw() to do necessary setup, calls draw() on the child, and 
    // then calls _endChildDraw() to revert the setup.  
    _drawChildren(ctx) {
        for (let ch = 0; ch < this._children.length; ch++) {
            // do the setup for drawing this child
            this._startChildDraw(ch, ctx);
            // do the actual drawing for this child
            // 
            // we need to take care that we without fail always call _endChildDraw(), 
            // otherwiset he save/restore stack in the context object will get messed up 
            // and that would likely ruin all drawing from then on.  so we put the 
            // child drawing in a try...finally construct. that will allow any 
            // exception to be propagated out, but will force the call to _endChildDraw() 
            // before we leave this function.
            try {
                this.children[ch].draw(ctx);
            }
            finally {
                // (always) do revert the setup for drawing this child
                this._endChildDraw(ch, ctx);
            }
        }
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Utility methods associated with measuring text
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Find a drawing context that can be used outside of actual drawing.
    //
    // A DrawContext object is passed into all drawing operations.  However, for
    // some operations outside drawing (normally just involving measurement of text),
    // a DrawContext object is still needed.  This method will attempt to find 
    // one for use.  It does this by first going up the parent hierarchy to try to
    // get the drawing context from the top object (which is associated with an
    // HTML canvas element which has the context we need).  However, if this object
    // is detached from the tree, that won't work.  In that case, as a fallback
    // we use a previously cached context object (that will have been stored the 
    // last time we created a top-level object).  If there is no such cached object, 
    // we return undefined.
    // 
    // Note that using a cached context object is potentially error prone, as there 
    // is a small chance that this object will subsequently be installed in a tree which
    // is being rendered in an HTML canvas object with a differently configured context.
    // As a result, it is best practice to create a TopLevel object before any objects 
    // to be installed under it that might need to measure text or otherwise use a 
    // drawing context outside drawing.  
    _findDrawContext() {
        // first try to get it from the top of the tree we are in
        let root = this._findTop();
        if (root)
            return root.canvasContext;
        // no root, so try the cache (which could be undefined, which would be our result)
        return DrawnObjectBase._drawContextCache;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Do simple measurement of the given text string.  This expects a string to 
    // measure, the font it's going to be drawn in (as a CSS font property string), and 
    // an optional drawing context object.  If the drawing context is missing (which it 
    // will be when this called outside of a drawing operation) _findDrawContext() will 
    // be called to find one (see the caveats there).  A simplified measurement of width 
    // and height of the bounding box, along with the distance from the top of the box to 
    // the baseline for the text is returned in an object literal.  
    _measureText(text, font, ctx) {
        // if we don't have a context to work from we have to try to find one
        if (!ctx) {
            ctx = this._findDrawContext();
            if (!ctx)
                throw new Error("No drawing context to measure text with in " +
                    this.constructor.name + "._measureText() -- " +
                    "try creating the TopObject before this object.");
        }
        // we now have a valid context, but we are going to mess with it a little
        // but don't want to change the context, so we save and restore.  We use a 
        // try-finally block here so we are sure to get a matching restore even
        // in the presence of an exception
        ctx.save();
        let metrics;
        try {
            // measure using our font
            ctx.font = font;
            metrics = ctx.measureText(text);
        }
        finally {
            // put the drawing context back the way we found it
            ctx.restore();
        }
        return { w: metrics.width,
            h: metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent,
            baseln: metrics.fontBoundingBoxAscent
        };
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Damage maintenance
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Declare that the display within the given area (expressed in the local coordinates 
    // of this object) may have been damaged (may no longer be correct) and should be 
    // redrawn at the next opportunity.  Note that the area given here must cover 
    // anything which might no longer be correct, but can safely be pessimistic by 
    // declaring extra damage. This method passes a damage report up the tree via 
    // our parent.
    damageArea(xv, yv, wv, hv) {
        //=== YOUR CODE HERE ===
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Declare that the entire bounding box has been damaged.  This is the typical 
    // default declaration for any damage since it is always safe to be pessimistic
    // and damage associated with this object can't have occurred outside it's bounding
    // box due to clipping.
    damageAll() { this.damageArea(0, 0, this.w, this.h); }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Receive a damage report from the given child object.  The area being reported
    // will be in the local coordinates of that child object (and will need to be 
    // converted to local coordinates of this object).  This should report any 
    // corresponding damage up the tree via our parent.  Note that the damage 
    // reported up will not be outside our own bounds, even though the child 
    // damage may be, since all drawing at or under this location in the tree is 
    // limited to our bounds by clipping.
    _damageFromChild(child, xInChildCoords, yInChildCoords, wv, hv) {
        //=== YOUR CODE HERE ===
    }
    get debugID() { return this._debugID; }
    static _genDebugID() { return DrawnObjectBase._nextDebugID++; }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a human readable "tag" string for this object -- a short string which 
    // gives basic information about the object.  This currently indicates the class of 
    // the object along with its uniquely identifying debugID.
    tagString() {
        return this.constructor.name + '<' + this.debugID + '>';
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a human readable string displaying the bounding box of this object.
    boxString() {
        return `x:${this._x},y:${this._y},w:${this._w},h:${this._h}`;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a human readable string giving a comma separated list of the "tag" strings
    // for each child.
    childTagsString() {
        let result = '';
        let sep = "";
        for (let ch of this._children) {
            result += sep + ch.tagString();
            sep = ',';
        }
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a possibly multi-line human readable string providing a debugString
    // for each child in our child list, separated (but not terminated) by newlines
    // with each line indented by the give amount.
    childListString(indent = 0) {
        let result = '';
        let sep = "";
        for (let ch of this._children) {
            result += sep + this.debugString();
            sep = '\n';
        }
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a numan readable string providing information about this object for 
    // for debugging purposes.  If withChildren is passed true (or omitted) tags for
    // the full child list will be included, otherwise, only the nubmer of children 
    // will be provided.
    debugString(withChildren = true) {
        var _a, _b;
        let result = `${this.tagString()}:[` +
            `${this.boxString()},visible:${this._visible},` +
            `parent=${(_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a.tagString()) !== null && _b !== void 0 ? _b : 'undefined'},`;
        if (withChildren)
            result += `${this._children.length}:[${this.childTagsString()}]]`;
        else
            result += `#children:${this._children.length}]`;
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a human readable debugging display of this object on the console log
    dump() { console.log(this.debugString()); }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a display of the full tree rooted at this object.  Each line of the 
    // display will be indented by an amount cooresponding to the depth within the 
    // tree, then a debugString(false) display will be provided.
    treeString(indent = 0) {
        let result = "";
        const indentStr = '  '; // two spaced per indent level
        // produce the indent
        for (let i = 0; i < indent; i++)
            result += indentStr;
        // and then the rest for this object
        result += this.debugString(false);
        result += '\n';
        // recursively do the children
        for (let child of this.children)
            result += child.treeString(indent + 1);
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Produce a debugging display of the tree rooted at this object on the console log.
    dumpTree() { console.log(this.treeString()); }
} // end of class DrawnObjectBase
// Internal cache of the last DrawContext that we have seen (when creating a 
// top level object, which was associated with an HTML canvas element).  This 
// is normally set only by code in TopObject (or a subclass).
DrawnObjectBase._drawContextCache = undefined;
// Counter for ID assignment
DrawnObjectBase._nextDebugID = 0;
//===================================================================
//# sourceMappingURL=DrawnObjectBase.js.map