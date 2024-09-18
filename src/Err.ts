//===================================================================
// (Static) class for configurable error handling.  
// This class provides static methods for configurable handling of an exception.
// In particular the static method Err.handle() accepts an object that was thrown
// as an exception and handles it in a way controlled by the Err.handleMethod
// property as follows:
//   * 'silent'        silently swallow the error and press ahead (probably a bad idea)
//   * 'message'       print message from the exception to console.log() and press ahead
//   * 'full_message'  print message and stack trace to console.log(), then press ahead 
//   * 'throw';        re-throw the exception
// where the messages and stack trace are taken from the exception object (if it 
// implements the Error interface).  The Err.handleMethod defaults to 'message'.
//===================================================================

// Settings for configuring error handling by the Err class
export type ErrHandlingSetting = 
    'silent'       | // silently swallow the error and press ahead (probably a bad idea)
    'message'      | // print message from the exception to console.log() and press ahead
    'full_message' | // print message and stack trace to console.log(), then press ahead 
    'throw';         // re-throw the exception
    
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

// (Static) class to encapsulate configurable error handling
export class Err {
    // Method that gets used to handle exceptions in Err.handle(), defaults to 'message'.
    protected static _handleMethod : ErrHandlingSetting = 'message';
    public static get handleMethod() {return this._handleMethod;}
    public static set handleMethod(v : ErrHandlingSetting) {this._handleMethod = v;}

    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

    // Handle the given exception based one a selected exception handling method.
    // The second (optional) parameter may provide extra message text to be included
    // with any message produced. If a specific exception handling method is passed in 
    // the optional third parameter that determines the type of response.  Otherwise 
    // (and more typically) we default to the global setting in Err.handleMethod.
    public static handle(
        except : any, 
        extraMessage : string = '',
        handleMeth : ErrHandlingSetting = Err.handleMethod) : void 
    {
        // start with a minimal message
        let exLine = 'Exception: ' + extraMessage + ' ';

        // if except implements the Error interface we can add a message from that 
        if ('message' in except) exLine += except.message;

        // now handle the error based on the selected setting
        switch (handleMeth) {
            case 'silent': 
            return;

            case 'message': 
                // if the exception implements Error, extract more from the stack trace
                if ('stack' in except) {
                    // add the second line of the stack trace to the output
                    // (first line is a repeat of the message)
                    let trace : string[] = except.stack.split("\n");
                    trace.shift();
                    const traceLine = trace.shift()?.trim();
                    exLine += " " + traceLine;
                }
                console.log(exLine);
            return;

            case 'full_message':
                const trace: string = ('stack' in except) ? except.stack : '';
                console.log("Exception: " + trace);
            return;

            case 'throw':
                throw except;
        }
    }
} // end Err class

//===================================================================
