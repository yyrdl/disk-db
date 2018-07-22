
const cache = {};

function get(){
    let args = [].slice.call(arguments);
    return cache[args.join("_")] || null;
}


function set(){
    let args = [].slice.call(arguments);
    let value = args.pop();
    cache[args.join("_")] = value;
}

function remove(){
    let args = [].slice.call(arguments);
    delete cache[args.join("_")];
}

exports.set = set;
exports.get = get;
exports.remove = remove;