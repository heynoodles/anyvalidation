/**
 * ValidatorFn :: param -> data -> errMsg
 */

exports.customMsg = function(replaceMsg, fn) {
    return function(data) {
        var msg = fn(data);
        if (msg) {
            return replaceMsg;
        }
    }
}

exports.prefix = function(pre, fn) {
    return function(data) {
        var msg = fn(data);
        if (msg) {
            return pre+msg;
        }
    }
}

exports.skipOrContinue = function(skipPredicate, next) {
    return function (data) {
        if (!skipPredicate(data)) {
            return next(data);
        }
    }
}

exports.required = function() {
    return function(data) {
        if (!data && data !== 0) {
            return "必填";
        }
    }
}

exports.largeEqualThan = function(num) {
    return function (data) {
        if (data < num) {
            return "必须大于等于" + num;
        }
    }
}

// export function largeThan(num) {
//     return function (data) {
//         if (data <= num) {
//             return "必须大于" + num;
//         }
//     }
// }

exports.lessEqualThan = function(num) {
    return function (data) {
        if (data > num) {
            return "必须小于等于" + num;
        }
    }
}

exports.isInteger = function() {
    return function(data) {
        if (data - 0 != data) {
            return '必须是数字';
        }
    }
}


// export function isNumber(data) {
//     var r = /^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$/;
//     if (!r.test(data)) {
//         return "必须为数字";
//     }
// }



// export function every() {
//     var fns = [].slice.call(arguments);
//     return function() {
//         var res = [];
//         for (var i=0; i < fns.length; i++) {
//             var msg = fns[i].apply(this, arguments);
//             if (msg) {
//                 res.push(msg);
//             }
//         }
//         if (res.length) {
//             return res.join(", ");
//         }
//     }
// }

exports.some = function() {
    var fns = [].slice.call(arguments);
    return function() {
        for (var i=0; i < fns.length; i++) {
            var msg = fns[i].apply(this, arguments);
            if (msg) {
                return msg;
            }
        }
    }
}


/**
 * 一些情况下, 变化参数可能需要懒加载. 可重用已定义的ValidatorFn
 * paramGetter :: () -> param
 * fn : ValidatorFn :: param -> data -> errMsg
 * eg. var lazyLargeThan = lazeParam(paramGetter)(largeThan)
 */
exports.lazyParam = function(paramGetter) {
    return function (fn) {
        return function(data) {
            var param = paramGetter.call(this);
            return fn(param)(data);
        }
    }
}
