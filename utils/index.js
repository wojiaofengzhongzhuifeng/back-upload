const fs = require('fs');

// 输入路径,返回这个路径是否为目录
function checkPathIsDir(path){
  return new Promise((resolve, reject)=>{
    fs.stat(path, (e, data)=>{
      if(e){console.error(e);return}
      if(data.isDirectory()){
        resolve(true)
      } else {
        resolve(false)
      }
    })
  });
}
module.exports = {checkPathIsDir}