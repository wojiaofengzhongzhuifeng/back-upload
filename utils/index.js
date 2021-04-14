const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);

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
// 获取指定目录下的一级目录
function getFolderAllFolderNameList(folderRelativePath){
  return new Promise((resolve, reject)=>{
    fs.readdir(path.join(appDir, folderRelativePath), (e, fileOrDirNameList)=>{
      let promiseList = [];
      fileOrDirNameList.forEach((fileOrDirName)=>{
        let fileOrDirPath = path.join(appDir, `${folderRelativePath}/${fileOrDirName}`)
        promiseList.push(checkPathIsDir(fileOrDirPath))
      });
      Promise.all(promiseList).then((checkPathResult)=>{
        let folderNameList = [];
        checkPathResult.forEach((isDirFlag, index)=>{
          if(isDirFlag){
            folderNameList.push(fileOrDirNameList[index]);
          }
        })
        resolve(folderNameList);
      });
    })
  });
}

module.exports = {checkPathIsDir, getFolderAllFolderNameList, appDir}