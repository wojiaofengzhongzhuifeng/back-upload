const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);
const uploadDir = path.join(appDir, './public/upload');
const tempDir = path.join(appDir, './public/upload/temp');
const archiver = require('archiver');
const compressing = require('compressing');


// 常量
let ARCHIVE_LIST = ['application/zip'];

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
// 输入目录路径,返回这个路径子文件夹是否有内容
function checkPathHasSubContent(path){
  return new Promise((resolve, reject)=>{
    fs.readdir(path, (e, data)=>{
      if(e){console.error(e);return}
      if(data.length === 0){
        resolve(false);
      } else {
        resolve(true);
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

async function zipFolder(folderPath) {
  const archive = archiver('zip', {
    zlib: { level: 6 } // Sets the compression level.
  });
  let targetZipPath = path.join(appDir, `./public/upload/tempZip/${folderPath}.zip`);
  const output = fs.createWriteStream(targetZipPath);
  archive.pipe(output);

  const fileNameList = await getFolderAllFileNameList(`./public/upload/${folderPath}`);

  fileNameList.forEach((fileName)=>{
    archive.append(fs.createReadStream(path.join(appDir, `./public/upload/${folderPath}/${fileName}`)), {name: fileName});
  });

  archive.finalize();


}

async function removeOldZipFile(filePath){
  return new Promise((resolve, reject)=>{
    fs.unlink(filePath, (err)=>{
      if(err){
        console.log(err)
      }
      resolve();
    });
  })
}

// 将 zip 解压
function unzip(zipPath, folderPath){
  return new Promise((resolve, reject)=>{
    compressing.zip.uncompress(zipPath, folderPath)
      .then(() => {
        console.log('success');
        resolve()
      })
      .catch(err => {
        console.error(err);
        reject()
      });
  });
}

// 获取一个目录所有文件和目录, 只返回第一级文件与文件夹名称, 不做递归处理
function getFileAndFolderName(folderPath){
  return new Promise((resolve, reject)=>{
    fs.readdir(folderPath, (e, fileOrDirNameList)=>{
      resolve(fileOrDirNameList);
    })
  });
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
  zipFolder,
  removeOldZipFile,
  ARCHIVE_LIST,
  checkPathHasSubContent,
  unzip,
  getFileAndFolderName,
}
