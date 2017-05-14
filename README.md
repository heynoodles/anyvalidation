# anyvalidation
一个可重用、可扩展的模型校验模块

* 校验函数可扩展，可以自己定义符合ValidatorFn接口的校验函数
* 校验函数高度重用，一个复杂的校验逻辑可由基本校验函数组合而成
* 与数据模型解耦，支持任意数据模型
* 校验配置可序列化，即支持从后端传入校验逻辑 

***
## how to use
#### validatorFn
validatorFn 是最基本的校验函数，它必须满足如下接口：
>ValidatorFn :: param -> data -> errMsg

其中，param生成校验函数的参数；
     data表示被校验的数据；
     errMsg表示返回的错误信息，如果没有错则返回undefined

比如小于等于的校验函数如下：

>lessEqualThan = function(num) {
    return function (data) {
        if (data > num) {
            return "必须小于等于" + num;
        }
    }
>}

比如，我们要校验某个输入是数字，且范围为[1, 9999999999], 则可写成如下：

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
