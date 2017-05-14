var parseConfig = require('./validatorConfigParser.js');
var vf = require('./validatorFn.js');
var prefix = require('./validatorFn.js').prefix;
var some = require('./validatorFn.js').some;
var isInteger = require('./validatorFn.js').isInteger;
var lessEqualThan = require('./validatorFn.js').lessEqualThan;
var largeEqualThan = require('./validatorFn.js').largeEqualThan;
var required = require('./validatorFn.js').required;

var propertyResolver = require('./propertyResolver.js').propertyResolver;
var validateAll = require('./templateValidator.js').validateAll;


var bizData = {
  "user": {
     "age": "not a number",
        "name": "hello kitty"
    },
  "count": null
};

// 1. use validatorFn api
console.log("/----------------- validatorFn api -------------------------/");
var validator = prefix("单次购买下限", some(isInteger(), largeEqualThan(1), lessEqualThan(9999999999)));
console.log(validator("not a number"));
console.log(validator(-1));
console.log(validator(10000000000000000));
console.log("/----------------- validatorFn api -------------------------/");


// 2. validator all
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
var templateValidator = validateAll(validatorInfo, propertyResolver);
console.log(templateValidator(bizData));

// 2. use config validatorFn api
console.log("/---------------- config validatorFn api -------------------/");
var validatorConfig = {
  "type": "function",
  "name": "prefix",
  "params": [
    {
      "type": "data",
      "value": "单次购买下限"
    },
    {
      "type": "function",
      "name": "some",
      "params": [
        {
          "type": "function",
          "name": "isInteger",
          "params": []
        },
        {
          "type": "function",
          "name": "largeEqualThan",
          "params": [
		    {
		      "type": "data",
		      "value": 1
		    }
          ]
        },
        {
          "type": "function",
          "name": "lessEqualThan",
          "params": [
          	{
		      "type": "data",
		      "value": 9999999999
		    }
          ]
        },
      ]
    }
  ]
};
var configValidator = parseConfig(validatorConfig);
console.log(configValidator("not a number"));
console.log(configValidator(-1));
console.log(configValidator(10000000000000000));
console.log("/---------------- config validatorFn api -------------------/");

// 3. use template validator api
console.log("/---------------- template validator api -------------------/");


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

var templateValidator = validateAll(validatorInfo2, propertyResolver, true);
console.log(templateValidator(bizData));
console.log("/---------------- template validator api -------------------/");
