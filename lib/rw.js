const fs = require("fs");

/**
 * @param {Interger} fd
 * @param {Buffer} buf
 * @param {Array} blocks
 * @param {Function} callback
 * @return {Null}
 * @internal
*/
function read(fd,buf,blocks,callback){

      let count = 0, called = false;
    
      function commit(err){
         count++;
         if(!called){
             if(err){
                 called == true;
                 return callback(err);
             }
             if(count === blocks.length){
                 called = true;
                 callback();
             }
         }
      }

      let offset = 0;

      for(let i=0;i<blocks.length;i++){
          let block = blocks[i];

          fs.read(fd,buf,offset,block.size,block.position,function(err){
            commit(err);
          });

          offset += block.size;
      }

}

 
/**
 * @param {Interger} fd
 * @param {Buffer} buf
 * @param {Array} blocks
 * @param {Function} callback
 * @return {Null}
 * @internal
 * 
*/
function write(fd,buf,blocks,callback){
    let count = 0, called = false;
    
    function commit(err){
       count++;
       if(!called){
           if(err){
               called == true;
               return callback(err);
           }
           if(count === blocks.length){
               called = true;
               callback();
           }
       }
    }

    let offset = 0;

    for(let i=0;i<blocks.length;i++){
        let block  = blocks[i];
        fs.write(fd,buf,offset,block.size,block.position,function(err){
            commit(err);
        });
        offset+= block.size;
    }

}

exports.read = read;
exports.write = write;

