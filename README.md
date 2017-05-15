# anyvalidation
一个可重用、可扩展的模型校验模块

## features
* 校验函数可扩展，可以自己定义符合ValidatorFn接口的校验函数
* 校验函数高度重用，一个复杂的校验逻辑可由基本校验函数组合而成
* 与数据模型解耦，支持任意数据模型
* 校验配置可序列化，即支持从后端传入校验逻辑 

***
## install
> npm install anyvalidation

## quick start
    var V = require('anyvalidation');    
    var AnyValidation = V.AnyValidation;
    var propertyResolver = V.propertyResolvers.propertyResolver;
    
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



## ValidatorFn
ValidatorFn 是最基本的校验函数，它必须满足如下接口：
> ValidatorFn :: param -> data -> errMsg

其中，param生成校验函数的参数；
     data表示被校验的数据；
     errMsg表示返回的错误信息，如果没有错则返回undefined

> V.defaultValidatorFns提供了一些常用ValidatorFn
    var V = require('anyvalidation');    
    var dvfs = V.defaultValidatorFns;

比如，可以从defaultValidatorFns中获取**小于等于**的校验函数如下：

    var lessEqualThan = dvfs.lessEqualThan;
    
    var lessEqualThan = function(num) {
        return function (data) {
            if (data > num) {
               return "必须小于等于" + num;
            }
       }
    }
可以看到，lessEqualThan本身并不能直接用作校验函数，只有将num传入后，才会制造出一个**小于等于num**的函数。

> 过程抽象也是ValidatorFn

经常，一个字段的校验是有很多简单约束组合而成。
比如，我们要校验某个输入是数字，且范围为[1, 9999999999]。
这里可以将整个约束拆解为：
1. 数字
2. 大于等于1
3. 小于等于9999999999
4. 过程：某一个校验函数验证失败，则直接结束返回errMsg, 否则下一个校验函数

其中，第4个过程约束也抽象为ValidatorFn，即**some**。
> Some :: [ValidatorFn] -> data -> errMsg
不同的是，它的第一个入参param为各校验函数。

有时，我们的errMsg需要一些修饰，比如说“单次购买下限小于1...”，即在原本的校验结果中再加入点主语。
于是，就可用过程**prefix**，它也是ValidatorFn
> prefix :: ("some subject" -> ValidatorFn) -> data -> errMsg

以上的复杂校验可以写成如下方式：

    var prefix = dvfs.prefix;
    var some = dvfs.some;
    var isInteger = dvfs.isInteger;
    var largeEqualThan = dvfs.largeEqualThan;
    var lessEqualThan = dvfs.lessEqualThan;
    var validator = prefix("单次购买下限", some(isInteger(), largeEqualThan(1), 
    lessEqualThan(9999999999)));
    console.log(validator("not a number"));
    console.log(validator(-1));
    console.log(validator(10000000000000000));
 
=>

        单次购买下限必须是数字
        单次购买下限必须大于等于1
        单次购买下限必须小于等于9999999999

## 模型校验
经常，我们需要校验一个页面的业务数据。业务数据本质上一棵树。

    var bizData = {
      "user": {
         "age": "not a number",
         "name": "hello kitty"
        },
      "count": null
    };

bizData树上的每个节点都有可能被加上约束。
在不同的操作场景下，有时需要校验某个节点，有时需要全量校验。
于是，我们把所有需要校验的节点打平，组成一个校验信息的数组**validatorInfo**。
通过**AnyValidation**，可以实现模型校验
### AnyValidation
| 参数名 | 描述 | 说明 |
| :--- | :--- | :--- |
| validatorInfo | 打平的校验配置信息 | 是一个数组。每个节点由resolvePath和校验信息组成 |
|  propertyResolver   | 从bizData中获取被校验值的函数     | 入参是resolvePath，系统已经提供propertyResolver（针对普通js对象），immuPropertyResolver（immutablejs）均挂在 V.propertyResolvers下，也可根据不同的状态管理方案做定制化     |
| opts | 可选选项 | fromConfig: vailidatorInfo是否为json方式， extendValidatorFns: 扩展ValidatorFn |

    var V = require('anyvalidation');    
    var AnyValidation = V.AnyValidation;
    var propertyResolver = V.propertyResolvers.propertyResolver;

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


## 校验配置化
有时，校验逻辑需要从后端传给前端，我们只需把AnyValidation的fromConfig设置为true，并调整**validatorInfo**。

    var V = require('anyvalidation');    
    var AnyValidation = V.AnyValidation;
    var propertyResolver = V.propertyResolvers.propertyResolver;
    var extendValidatorFns = {
        "whateverWrong": function() {
            return function(data) {
                return "WRONG!!";
            }
        }   
    }
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
