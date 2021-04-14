const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const uploadDir = path.join(appDir, './public/upload');

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

class Response {
  constructor(config) {
    const {code, message, data} = config;
    this.code = code;
    this.message = message;
    this.data = data;

  }
}

function createFolderInUploadFolder(newFolderName){
  return new Promise((resolve, reject)=>{
    fs.mkdir(`${uploadDir}/${newFolderName}`, (e)=>{
      if(e){console.log(e);return}
      resolve(new Response({data: newFolderName, message: '成功', code: 200}))
    });
  });
}

module.exports = {checkPathIsDir, getFolderAllFolderNameList, appDir, Response, uploadDir, createFolderInUploadFolder}