module.exports = {
  filter: function filter(list, predicate){
    predicate = predicate || list;
    if(list === predicate){
      return list => filter(list, predicate);
    }else{
      return Promise.all(list
        .map(x => predicate(x)
          .then(t => ({x:x, t:t}))
        )
      ).then(a => a
        .filter(x => x.t)
        .map(x => x.x)
      );
    }
  }
};