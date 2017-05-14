# anyvalidation
一个可重用、可扩展的模型校验模块

***
## how to use
#### use validatorFn api

    console.log("/----------------- validatorFn api -------------------------/");
    var validator = prefix("单次购买下限", some(isInteger(), largeEqualThan(1), lessEqualThan(9999999999)));
    console.log(validator("not a number"));
    console.log(validator(-1));
    console.log(validator(10000000000000000));
    console.log("/----------------- validatorFn api -------------------------/");

=>

    /----------------- validatorFn api -------------------------/
        单次购买下限必须是数字
        单次购买下限必须大于等于1
        单次购买下限必须小于等于9999999999
    /----------------- validatorFn api -------------------------/

#### use config validatorFn api

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

=>

    /---------------- config validatorFn api -------------------/
        单次购买下限必须是数字
        单次购买下限必须大于等于1
        单次购买下限必须小于等于9999999999
    /---------------- config validatorFn api -------------------/


#### use template validator api

    console.log("/---------------- template validator api -------------------/");
    var bizData = {
        "user": {
           "age": "not a number",
            "name": "hello kitty"
        },
        "count": null
    };

    var validatorInfo = [
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

    var templateValidator = validateAll(validatorInfo, propertyResolver);
    console.log(templateValidator(bizData));
    console.log("/---------------- template validator api -------------------/");

=> 

    /---------------- template validator api -------------------/
        [ { key: 'count', errMsg: '数量必填' }, { key: 'user_age', errMsg: '年龄必须是数字' } ]
    /---------------- template validator api -------------------/
