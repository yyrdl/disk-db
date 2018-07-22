

function LRU(num){
    this.maxNum = num;
    this.pool = [];
}

LRU.prototype.get = function(id){
  let value = null;
  for(let i=0;i<this.pool.length;i++){
      if(this.pool[i].id == id){
          value = this.pool[i].value;
          break;
      }
  }

  if(null === value){
      return null;
  }

  this.pool = this.pool.filter((it)=>{
      return it.id != id;
  });

  this.pool.unshift({
      id:id,
      value:value
  });
  return value;
}

LRU.prototype.add = function(id,value){
   this.pool.unshift({
       id:id,
       value:value
   });

   if(this.pool.length > this.maxNum){
       let r = this.pool.pop();
       return r.value;
   }
   return null;
}


module.exports = LRU;
