const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const uploadDir = path.join(appDir, './public/upload');
const tempDir = path.join(appDir, './public/upload/temp');

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
// 获取指定目录下的一级所有目录
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

// 获取指定目录下的所有文件名称
function getFolderAllFileNameList(folderRelativePath){
  return new Promise((resolve, reject)=>{
    fs.readdir(path.join(appDir, folderRelativePath), (e, fileOrDirNameList)=>{
      let promiseList = [];
      fileOrDirNameList.forEach((fileOrDirName)=>{
        let fileOrDirPath = path.join(appDir, `${folderRelativePath}/${fileOrDirName}`)
        promiseList.push(checkPathIsDir(fileOrDirPath))
      });
      Promise.all(promiseList).then((checkPathResult)=>{
        let fileNameList = [];
        checkPathResult.forEach((isDirFlag, index)=>{
          if(!isDirFlag){
            fileNameList.push(fileOrDirNameList[index]);
          }
        })
        resolve(fileNameList);
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

// todo 应该将 temp 目录下的文件全部删除
function removeAllFileAndFolder(folderPath){

}

module.exports = {
  checkPathIsDir,
  getFolderAllFolderNameList,
  appDir,
  Response,
  uploadDir,
  createFolderInUploadFolder,
  tempDir,
  removeAllFileAndFolder,
  getFolderAllFileNameList,
}