var parseConfig = require('./validatorConfigParser.js');
var keyGen = require('./utils.js').keyGen;


function getValidatorFn(fromConfig, vi, opt) {
    return fromConfig ? parseConfig(vi.validatorConfig, opt) : vi.validatorFn;
}

function validateAll(validatorInfos, pathResolver, opt) {
    var fromConfig = opt && opt.fromConfig;
    var extendValidatorFns = opt && opt.extendValidatorFns;
	return function(bizData) {
        return validatorInfos.reduce(function(pre, vi) {
            var resolvePath = vi.resolvePath;
            var validateFn = getValidatorFn(fromConfig, vi, opt);
            var data = pathResolver(bizData, resolvePath);
            var errMsg = validateFn(data);
            return errMsg ? pre.concat({key: keyGen(resolvePath), errMsg: errMsg}) : pre;
        }, [])
    }
}

function validateOne(validatorInfoMap, pathResolver, opt) {
    var fromConfig = opt && opt.fromConfig;
    var extendValidatorFns = opt && opt.extendValidatorFns;
    return function(resolvePath, data) {
        var vi  = validatorInfoMap[keyGen(resolvePath)];
        var validatorFn = getValidatorFn(fromConfig, vi, opt);
        return validatorFn(data);
    }
}

module.exports.validateAll = validateAll;
module.exports.validateOne = validateOne;