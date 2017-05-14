var dvf = require('./validatorFn.js');
var parseConfig = require('./validatorConfigParser.js');
var propertyResolvers = require('./propertyResolver.js');
var validateAll = require('./templateValidator.js').validateAll;
var validateOne = require('./templateValidator.js').validateOne;
var keyGen = require('./utils.js').keyGen;


var AnyValidation = function(validatorInfo, propertyResolver, opt) {
	this.validatorInfo  = validatorInfo;
	this.propertyResolver = propertyResolver;
	this.opt = opt;

	this.validatorInfoMap = validatorInfo.reduce(function(pre, cur) {
		pre[keyGen(cur.resolvePath)] = cur;
		return pre;
	}, {});
}

AnyValidation.prototype.validateAll = function(bizData) {
	return validateAll(this.validatorInfo, this.propertyResolver, this.opt)(bizData);
}

AnyValidation.prototype.validateOne = function(resolvePath, data) {
	return validateOne(this.validatorInfoMap, this.propertyResolver, this.opt)(resolvePath, data);
}


var V = {
	defaultValidatorFns: dvf,
	parseConfig: parseConfig,
	propertyResolvers: propertyResolvers,
	AnyValidation: AnyValidation
}; 



module.exports = V;
