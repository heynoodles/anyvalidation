var propertyResolver = function(target, path) {
    var ret = target;
    path.forEach(function(p) {
        if (ret) {
            if (p in ret) {
                ret = ret[p];
            } else {
                ret = null
            }
        }
        return ret;
    });
    return ret;
};

var immuPropertyResolver = function(target, path) {
    return target.getIn(path);
}

module.exports.propertyResolver = propertyResolver;
module.exports.immuPropertyResolver = immuPropertyResolver;