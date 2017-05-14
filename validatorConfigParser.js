var vf = require('./validatorFn.js');

var DATA_TYPE = "data";
var FUNCTION_TYPE = "function";
var PARAMS = "params";
var NAME = "name";

var parseParams = function(params, opt) {
    return params.reduce(function(pre, param) {
        if (param.type == DATA_TYPE) {
            return pre.concat(param.value);
        } else if (param.type == FUNCTION_TYPE) {
            return pre.concat(parseConfig(param, opt))
        }
    }, []);
};

var parseConfig = function(conf, opt) {
	if (conf.type == FUNCTION_TYPE) {
		var params = parseParams(conf[PARAMS], opt);
		var validateFn = vf[conf[NAME]] || (opt && opt.extendValidatorFns[conf[NAME]]);
		return validateFn.apply(this, params);
	}
};

module.exports = parseConfig;