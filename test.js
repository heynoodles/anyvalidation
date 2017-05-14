var V = require('./index.js').V;
var AnyValidation = V.AnyValidation;
var valFn = V.defaultValidatorFns;
var parseConfig = V.parseConfig;
var propertyResolver = V.propertyResolvers.propertyResolver;

var prefix = valFn.prefix;
var some = valFn.some;
var isInteger = valFn.isInteger;
var largeEqualThan = valFn.largeEqualThan;
var lessEqualThan = valFn.lessEqualThan;
var required = valFn.required;


var extendValidatorFns = {
	"whateverWrong": function() {
		return function(data) {
			return "WRONG!!";
		}
	}
}

var bizData = {
  "user": {
     "age": "not a number",
     "name": "hello kitty"
    },
  "count": null
};

// 1. validator fn
var validator = prefix("单次购买下限", some(isInteger(), largeEqualThan(1), lessEqualThan(9999999999)));
console.log(validator("not a number"));
console.log(validator(-1));
console.log(validator(10000000000000000));



// 2. any validation
var validatorInfo = [
  {
    "resolvePath": ["count"],
    "validatorFn": prefix("数量", some(required(), isInteger()))
  },
  {
    "resolvePath": ["user", "age"],
    "validatorFn": prefix("年龄", some(required(), isInteger()))
  }
];
var anyVali = new AnyValidation(validatorInfo, propertyResolver);
console.log(anyVali.validateAll(bizData));
console.log(anyVali.validateOne(["user", "age"], "jajajajajaja"));

// 3. from json config
var validatorInfo2 = [
	{
		"resolvePath": ["count"],
		"validatorConfig": {
            "type": "function",
            "name": "prefix",
            "params": [
                {
                    "type": "data",
                    "value": "数量"
                },
                {
                    "type": "function",
                    "name": "some",
                    "params": [
                    
                    {
                            "type": "function",
                            "name": "whateverWrong",
                            "params": []
                        },
                        {
                            "type": "function",
                            "name": "required",
                            "params": []
                        },
                        {
                            "type": "function",
                            "name": "isInteger",
                            "params": []
                        }
                    ]
                }
            ]
        }
	},
    {
        "resolvePath": ["user", "age"],
        "validatorConfig": {
            "type": "function",
            "name": "prefix",
            "params": [
                {
                    "type": "data",
                    "value": "年龄"
                },
                {
                    "type": "function",
                    "name": "some",
                    "params": [
                        {
                            "type": "function",
                            "name": "required",
                            "params": []
                        },
                        {
                            "type": "function",
                            "name": "isInteger",
                            "params": []
                        }
                    ]
                }
            ]
        }
    }
];

var anyValidation = new AnyValidation(validatorInfo2, propertyResolver, {fromConfig: true, extendValidatorFns: extendValidatorFns})
console.log(anyValidation.validateAll(bizData));
console.log(anyValidation.validateOne(["user", "age"], "jajajajajaja"))
