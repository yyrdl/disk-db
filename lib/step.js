const co = require("zco");


co(function*(){
    yield checkFile();
    yield loadBlock();
    yield loadIndex();
    
})();