//===================================================================
// Class for a size configuration object -- a declaration of sizing capability indicating
// a min, natural, and max size.  Most parts of the system use size  configuration 
// object literals, so this class provides static methods to operate on those as well
//===================================================================
export class SizeConfig {
    constructor(configOrNat, minv, maxv) {
        this._value = { nat: 0, min: 0, max: 0 };
        // work out which variant of parameters we have
        if (!configOrNat) {
            // no paremters means zero-valued fixed configuration
            // ... leave as is
        }
        else if (typeof configOrNat === 'number') {
            // broken out numbers; if any missing, use the natural value
            this._value.nat = configOrNat;
            this._value.min = minv !== null && minv !== void 0 ? minv : configOrNat;
            this._value.max = maxv !== null && maxv !== void 0 ? maxv : configOrNat;
        }
        else {
            // it's a full configuration, just assign
            this._value = configOrNat;
        }
        this.makeCanonical();
    }
    ;
    get value() { return this._value; }
    set value(v) { this._value = v; }
    // Accessors that break out parts of our value (min, nat, max)
    get nat() { return this._value.nat; }
    set nat(v) { this._value.nat = v; }
    get min() { return this._value.min; }
    set min(v) { this._value.min = v; }
    get max() { return this._value.max; }
    set max(v) { this._value.max = v; }
    // Set this value to a fixed configuration (min=max=nat) with the given natural size
    // If no size is given, the current natural size of this configuration is used
    // but the rest of the configuration is set to be fixed at that value.
    setFixed(fixedV) {
        this._value.nat = fixedV !== null && fixedV !== void 0 ? fixedV : this._value.nat;
        this._value.min = this._value.max = this._value.nat;
    }
    // Return a fixed configuration with the given natural (and min and max) size
    static fixed(fixedV) {
        return { nat: fixedV, min: fixedV, max: fixedV };
    }
    // Set this value to a fully elastic (fully expandable/contractable) value of the 
    // given size (or the current natural size if none is given).  This sets min = 0,
    // and max = "infinite"
    setElastic(natV) {
        this._value.nat = natV !== null && natV !== void 0 ? natV : this._value.nat;
        this._value.min = 0;
        this._value.max = SizeConfig.INF;
    }
    // Return a fully elastic (fully expandable/contractable) configuration of the 
    // given size.  This provides: min = 0, natural = value given, and max = "infinite")
    static elastic(natV) {
        return { nat: natV, min: 0, max: SizeConfig.INF };
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Adjust this object to ensure it is in canonical form.  That is: min >= 0, 
    // min < max, and min <= nat <= max.  
    makeCanonical() {
        if (this.min < 0)
            this.min = 0;
        if (this.max < 0)
            this.max = 0;
        if (this.min > this.max) {
            let t = this.min;
            this.min = this.max;
            this.max = t;
        }
        if (this.nat < this.min)
            this.nat = this.min;
        if (this.nat > this.max)
            this.nat = this.max;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Adjust the given SizeConfigLiteral object to ensureit is in canonical form.  
    // That is: min >= 0, min < max, and min <= nat <= max. 
    static canonicalize(conf) {
        if (conf.min < 0)
            conf.min = 0;
        if (conf.max < 0)
            conf.max = 0;
        if (conf.min > conf.max) {
            let t = conf.min;
            conf.min = conf.max;
            conf.max = t;
        }
        if (conf.nat < conf.min)
            conf.nat = conf.min;
        if (conf.nat > conf.max)
            conf.nat = conf.max;
        return conf;
    }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------  
    // (Piecewise) add the given configuration to this one.  
    add(other) {
        this.nat += other.nat;
        this.min += other.min;
        this.max += other.max;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a configuration that is the (piecewise) sum two configurations
    static add(conf1, conf2) {
        return { nat: conf1.nat + conf2.nat, min: conf1.min + conf2.min,
            max: conf1.max + conf2.max };
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Set the parts of this configuration to the (piecewise) maximum of itself and
    // another configuration.
    maximum(other) {
        this.nat = Math.max(this.nat, other.nat);
        this.min = Math.max(this.min, other.min);
        this.max = Math.max(this.max, other.max);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a configuration that is the (piecewise) maximum two configurations
    static maximum(conf1, conf2) {
        return { nat: Math.max(conf1.nat, conf2.nat), min: Math.max(conf1.min, conf2.min),
            max: Math.max(conf1.max, conf2.max) };
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Do an equality comparison between this configuration and another
    eq(other) {
        return (this.nat === other.nat) && (this.min === other.min) &&
            (this.max === other.max);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Do an equality comparison for two configurations
    static eq(c1, c2) {
        return (c1.min === c2.min) && (c1.max === c2.max) && (c1.nat === c2.nat);
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Force the given configuration (aConfig) to conform to the min and max limits of 
    // another configuration (limitingConfig), and that the natural size 
    static fitWithinConfig(aConfig, limitingConfig) {
        let result = aConfig;
        // enforce min/max limits
        result.min = Math.max(aConfig.min, limitingConfig.min);
        result.max = Math.min(aConfig.max, limitingConfig.max);
        // push natural back inside that if necessary
        SizeConfig.canonicalize(result);
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Adjust the given number to be within the range allowed by the min and max 
    // of the given size configuration
    static withinConfig(val, config) {
        if (val < config.min)
            val = config.min;
        if (val > config.max)
            val = config.max;
        return val;
    }
} // end class SizeConfig
//-------------------------------------------------------------------
// Properties
//-------------------------------------------------------------------
// Value we use for "infinite" maximum (i.e. to make things fully elastic)
SizeConfig.INF = Number.MAX_SAFE_INTEGER;
//===================================================================
//# sourceMappingURL=SizeConfig.js.map