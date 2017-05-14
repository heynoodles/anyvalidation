# anyvalidation
一个可重用、可扩展的模型校验模块

## features
* 校验函数可扩展，可以自己定义符合ValidatorFn接口的校验函数
* 校验函数高度重用，一个复杂的校验逻辑可由基本校验函数组合而成
* 与数据模型解耦，支持任意数据模型
* 校验配置可序列化，即支持从后端传入校验逻辑 

***
## how to install
> npm install anyvalidation

## quick start
#### validatorFn
validatorFn 是最基本的校验函数，它必须满足如下接口：
>ValidatorFn :: param -> data -> errMsg

其中，param生成校验函数的参数；
     data表示被校验的数据；
     errMsg表示返回的错误信息，如果没有错则返回undefined

比如小于等于的校验函数如下：

    var V = require('anyvalidation');    
    var valFn = V.defaultValidatorFns;
    var lessEqualThan = valFn.lessEqualThan;
    
    var lessEqualThan = function(num) {
        return function (data) {
            if (data > num) {
               return "必须小于等于" + num;
            }
       }
    }


> V.defaultValidatorFns提供了一些常用ValidatorFn

比如，我们要校验某个输入是数字，且范围为[1, 9999999999], 则可写成如下：
    
    var validator = prefix("单次购买下限", some(isInteger(), largeEqualThan(1), lessEqualThan(9999999999)));
    console.log(validator("not a number"));
    console.log(validator(-1));
    console.log(validator(10000000000000000));
 
=>

        单次购买下限必须是数字
        单次购买下限必须大于等于1
        单次购买下限必须小于等于9999999999

#### 模型校验
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
    console.log(anyVali.validateOne(["user", "age"], "not a number"));

=>

    [ { key: 'count', errMsg: '数量必填' },
      { key: 'user_age', errMsg: '年龄必须是数字' } ]
    年龄必须是数字


#### 校验配置化

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

=>

    [ { key: 'count', errMsg: '数量WRONG!!' },
      { key: 'user_age', errMsg: '年龄必须是数字' } ]
    年龄必须是数字
