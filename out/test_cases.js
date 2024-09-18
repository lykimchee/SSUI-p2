//-------------------------------------------------------------------
// This file provides test cases and/or demonstration of code for the project
// The function runTests() declared here is called from index.html as the 
// main program.
//
// You can use this file for any testing that you would like to do.
//
// During grading this file will be entireluy replaced by a version that provides a 
// grading script.
//
// The version provided below provides a demonstration of some of the basic subclasses.
// There is a static drawing part, but then some very simple input handling is provided
// that allows you to resize objects dynamically for testing purposes.  No affordance
// for this is really provide (except a textual prompt) but you can press then drag
// inside any object that is a direct child of the root object to resize it.  But note
// that some objects (e.g., TextObjects) are not resizable and will not change.
//-------------------------------------------------------------------
import { Err } from "./Err.js";
import { DrawableImage } from "./DrawableImage.js";
import { TopObject } from "./TopObject.js";
import { FilledObject } from "./FilledObject.js";
import { TextObject, TextObject_debug } from "./TextObject.js";
import { IconObject } from "./IconOjbect.js";
// Layout related subclasses
import { Column_debug } from "./Column.js";
import { Row_debug } from "./Row.js";
import { Strut_debug } from "./Strut.js";
import { Spring_debug } from "./Spring.js";
//-------------------------------------------------------------------
// Top of our test object tree
const root = new TopObject("p2-main-canvas");
//-------------------------------------------------------------------
// Main testing routine -- invoked from index.html
//-------------------------------------------------------------------
export function runTests() {
    // We turn off the special handling of damage for asynchronous image loads
    // until we have static drawing done and we are waiting for the loads to complete.
    root.allowAsyncDamageRedraw = false;
    console.log("-------------------------");
    console.log("---- Static Test Cases ---");
    console.log("-------------------------");
    // set up the tree with all the test objects
    testFilled(root);
    testIcon(root, 725, 10);
    testText(root, 200, 50);
    testCol(root, 375, 300);
    testRow(root, 10, 600);
    testRowCol(root, 700, 350);
    // tests we are no longer using
    // testDrawableImage(root.canvasContext, 700, 300); // no longer works...
    // testErr(); // intentionally throws an exception!
    // put in a text object to prompt for our interactive testing
    root.addChild(new TextObject(10, 768 - 50, "Press and drag inside any object to resize it", "40px sans-serif", 0, "red"));
    // draw everything
    root.layoutAndDrawAll();
    // Enable extra redraws for damage declared due to "late" asynchronous image loads
    // This will cause calls to top.layoutAndDrawAll() to happen whenever asynchronous
    // loads complete.
    root.allowAsyncDamageRedraw = true;
    // dump the tree for debugging
    root.dumpTree();
    console.log("------------------------------");
    console.log("---- End Static Test Cases ---");
    console.log("------------------------------");
    // Start input handling for our simple interative resizing test
    setupInputHandling(resizer);
}
//-------------------------------------------------------------------
// Rudimentary input handling so we can have interactive resizing tests
function setupInputHandling(dragHnd) {
    dragHandler = dragHnd;
    root.owningCanvas.onmousedown = handleMouseEvent;
    root.owningCanvas.onmousemove = handleMouseEvent;
    root.owningCanvas.onmouseup = handleMouseEvent;
}
// Function we will call to respond to drags
let dragHandler = undefined;
// State of our simple dragging interaction
let interactionState = 'start';
// Handle mouse input.  This implements a simple drag finite state machine:
//
//  (start)--- dn --->(dragging)----
//     ^                |  ^        |
//     ------- up ------   -- move--
//
// at each new drag position we call dragHandler() 
function handleMouseEvent(evt) {
    // console.log("event: '" + evt.type + "'" + "btn=" + evt.button);
    // we are only interested in up or down events for button 0 (left button)
    if ((evt.type === 'mousedown' || evt.type === 'mouseup') && evt.button !== 0) {
        return;
    }
    // implement a small finite state machine as a doubly nested switch
    //   first switch on which state we are in
    //   then within each state determine transition (and action) based on event type
    switch (interactionState) {
        case 'start':
            switch (evt.type) {
                case 'mousedown':
                    //
                    //  (start)--- dn --->(dragging)
                    //
                    // console.log("start drag");
                    // try to pick an object at this position and make that 
                    // the dispatch target if found
                    objToResize = pickFirstLevel(evt.offsetX, evt.offsetY);
                    // call the handler that actually responds to a drag to this position
                    if (dragHandler)
                        dragHandler(evt.offsetX, evt.offsetY);
                    // transition to our new state
                    interactionState = 'dragging';
                    break;
                case 'mousemove':
                    // do nothing and stay in the same state
                    break;
                case 'mouseup':
                    // do nothing and stay in the same state
                    break;
            }
            break;
        case 'dragging':
            switch (evt.type) {
                case 'mousedown':
                    // this will probably never occur, but...
                    //
                    // should already be down, an up must have been lost.
                    // do the missing up transition (which would put us in start state)
                    // and then to the transition from there with this down
                    // console.log("lost up -- dragging");
                    objToResize = pickFirstLevel(evt.offsetX, evt.offsetY);
                    if (dragHandler)
                        dragHandler(evt.offsetX, evt.offsetY);
                    interactionState = 'dragging';
                    break;
                case 'mousemove':
                    // is the first (left) button still down?
                    if (!(evt.buttons & 0b00001)) {
                        // no -- seem to have lost the up event (outside window?)
                        // so transition as if we got that instead
                        // console.log("lost up -- end drag");
                        objToResize = undefined;
                        interactionState = 'start';
                    }
                    else { // normal situation...
                        //   (dragging)----
                        //       ^        |
                        //       -- move--
                        //
                        // console.log('drag');
                        if (dragHandler)
                            dragHandler(evt.offsetX, evt.offsetY);
                    }
                    break;
                case 'mouseup':
                    //  (start)           (dragging) 
                    //     ^                | 
                    //     ------- up ------   
                    //
                    if (evt.button !== 0)
                        break;
                    // console.log("end drag");
                    objToResize = undefined;
                    interactionState = 'start';
                    break;
            }
    }
}
// Object that we will resize by dragging.  Must be a direct child of the root
let objToResize;
// Handler that we use to resize objects when we get a new drag position
function resizer(x, y) {
    // console.log("handling drag to " + x + " " + y);
    if (objToResize) {
        // limit minimum size so we don't go negative, 
        // and so it can be always be seen and resized again later 
        let newW = x - objToResize.x;
        if (newW < 10)
            newW = 10;
        let newH = y - objToResize.y;
        if (newH < 10)
            newH = 10;
        // console.log("resizing to " + newW + "," + newH);
        objToResize.size = { w: newW, h: newH };
        root.layoutAndDrawAll();
    }
}
// function to find an object which is a first level child of the root whose
// bounding box contains the given x,y point (AKA, the point picks that object)
function pickFirstLevel(x, y) {
    // pick in reverse of drawing order since last drawn is on top
    for (let i = root.children.length - 1; i > 0; i--) {
        const cand = root.children[i];
        if ((x >= cand.x) && (x <= cand.x + cand.w) &&
            (y >= cand.y) && (y <= cand.y + cand.h)) {
            return cand;
        }
    }
    return undefined;
}
//-------------------------------------------------------------------
// Individual test functions
//-------------------------------------------------------------------
// A palette of blue(ish) colors in increasing lightness
const blueishColors = [
    '#eaf9ff', '#e2f6fe', '#daf4fe', '#d2f2fe', '#c9f0fe',
    '#c1edfe', '#b9ebfe', '#b1e9fe', '#a9e6ff', '#a1e4ff',
    '#99e2ff', '#90e0ff', '#88deff', '#80dbff', '#78d9ff',
    '#70d6ff', '#68d4ff', '#5fd2ff', '#57d0ff', '#4fcdff',
    '#47cbff', '#3fc9ff', '#37c6ff', '#2ec4ff', '#26c2ff',
    '#1ec0ff', '#16bdff', '#0ebbff', '#06b9ff', '#00b5fc',
    '#00b0f4', '#00aaec', '#00a4e4', '#009edc', '#0098d4',
    '#0092cc', '#008cc3', '#0087bb', '#0081b3', '#007bab',
    '#0075a3', '#006f9b', '#006992', '#00638a', '#005d82',
    '#00587a', '#005272', '#004c6a', '#004661', '#004059',
    '#003a51', '#003449', '#002e41', '#002939', '#002330',
    '#001d28', '#001720', '#001118', '#000b10', '#000508',
];
//-------------------------------------------------------------------
function testFilled(top) {
    for (let i = 0; i < 10; i++) {
        let cl = blueishColors[(blueishColors.length - 1 - (i * 2 + 15)) % blueishColors.length];
        let aChild = new FilledObject(i * 25, i * 50, 100, 100, cl);
        aChild.addChild(new FilledObject(20, 10, 20, 200, 'gray'));
        aChild.addChild(new FilledObject(25, 15, 200, 25, 0x6E260E)
            .addChild(new FilledObject(5, 7, 10, 10, 'white')));
        top.addChild(aChild);
    }
}
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
function testIcon(top, x, y) {
    const icn1 = new IconObject(x, y, 100, 100, "./images/test_image.png");
    icn1.resizesImage = false;
    top.addChild(icn1);
    const icn2 = new IconObject(x + 50, y + 100, 100, 100, "./images/test_image.png");
    icn2.resizesImage = true;
    top.addChild(icn2);
}
function testText(top, x, y) {
    const fnt1 = "40px sans-serif";
    const fnt2 = "100px Brush Script MT";
    top.addChild(new TextObject_debug(x, y, "{Testing}: ÃWMjyz", fnt1, { w: 10, h: 0 }, 'blue'));
    top.addChild(new TextObject_debug(x + 10, y + 70, "{Test}:ÃMjz", fnt2, { w: 0, h: 0 }, 'black', 'stroke'));
}
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
function testCol(top, x, y) {
    let xpos = x;
    let ypos = y;
    const col1 = new Column_debug(xpos, ypos);
    top.addChild(col1);
    for (let i = 0; i < 3; i++) {
        let cl = blueishColors[(blueishColors.length - 1 - (i * 4 + 15)) % blueishColors.length];
        let aChild = new FilledObject(i * 25, i * 50, 100 - (i * 10), 100, cl);
        col1.addChild(aChild);
        let st = new Strut_debug(10, 20);
        col1.addChild(st);
    }
    col1.h = 3 * 120; // exactly the size of the children
    // col1.wJustification defaults to 'left'
    const col2 = new Column_debug(xpos + 100 + 10, ypos);
    top.addChild(col2);
    for (let i = 0; i < 3; i++) {
        let cl = blueishColors[(blueishColors.length - 1 - (i * 4 + 25)) % blueishColors.length];
        let aChild = new FilledObject(i * 25, i * 50, 100 - (i * 10), 100, cl);
        col2.addChild(aChild);
        let st = new Spring_debug('h');
        if (i === 1)
            st = new Strut_debug(10, 30);
        col2.addChild(st);
    }
    col2.h = 3 * 100 + 30 + 50; // size of fixed size children + 50;
    col2.wJustification = 'center';
    const col3 = new Column_debug(xpos + 200 + 20, ypos);
    top.addChild(col3);
    for (let i = 0; i < 3; i++) {
        let cl = blueishColors[(blueishColors.length - 1 - (i * 4 + 45)) % blueishColors.length];
        let aChild = new FilledObject(i * 25, i * 50, 100 - (i * 10), 100, cl);
        col3.addChild(aChild);
        let st = new Spring_debug('h');
        if (i === 0)
            st = new Strut_debug(10, 40);
        col3.addChild(st);
    }
    col3.h = 3 * 100 + 40; // exactly the size of the non-spring children
    col3.wJustification = 'right';
    // set this column up as the object we resize after static tests
    objToResize = col3;
}
function testRow(top, x, y) {
    let xpos = x;
    let ypos = y;
    const r1 = new Row_debug(xpos, ypos);
    top.addChild(r1);
    for (let i = 0; i < 3; i++) {
        let cl = blueishColors[(blueishColors.length - 1 - (i * 4 + 15)) % blueishColors.length];
        let aChild = new FilledObject(i * 25, i * 50, 100 - (i * 10), 100, cl);
        r1.addChild(aChild);
        let st = new Spring_debug('w');
        r1.addChild(st);
    }
    r1.w = 3 * 120; // exactly the size of the children
    r1.hJustification = 'center';
}
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
function testRowCol(top, x, y) {
    const r1 = new Row_debug(x, y);
    let clcnt = 0;
    top.addChild(r1);
    for (let i = 0; i < 3; i++) {
        if (i == 1) {
            let achild = new Column_debug(0, 0, 40, 200);
            achild.wJustification = 'center';
            r1.addChild(achild);
            r1.addChild(new Spring_debug('w'));
            for (let j = 0; j < 3; j++) {
                achild.addChild(new FilledObject(0, 0, 50, 50, 'burlywood'));
                if (j === 1) {
                    achild.addChild(new Spring_debug('h'));
                }
                else {
                    achild.addChild(new Strut_debug(20, 20));
                }
            }
        }
        else {
            r1.addChild(new FilledObject(0, 0, 50, 50 + i * 10, 'sienna'));
            new Spring_debug('w');
            r1.addChild(new Spring_debug('w'));
        }
    }
    r1.w = 200;
    r1.hJustification = 'center';
}
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
// This intentionally throws an exception!
function testErr() {
    console.log("-- Testing error handler --");
    Err.handleMethod = 'silent';
    try {
        throw new Error("My error message 1");
    }
    catch (e) {
        Err.handle(e);
    }
    Err.handleMethod = 'message';
    try {
        throw new Error("My error message 2");
    }
    catch (e) {
        Err.handle(e, "(extra)");
    }
    Err.handleMethod = 'full_message';
    try {
        throw new Error("My error message 3");
    }
    catch (e) {
        Err.handle(e);
    }
    Err.handleMethod = 'throw';
    try {
        throw new Error("My error message 4");
    }
    catch (e) {
        Err.handle(e);
    }
}
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
function testDrawableImage(ctx, x, y) {
    function notif(evt, img) {
        console.log("notified; drawing...");
        if (img.canvasImage)
            ctx.drawImage(img.canvasImage, x, y);
    }
    let di1 = new DrawableImage("./images/test_image.png", notif);
}
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
//# sourceMappingURL=test_cases.js.map