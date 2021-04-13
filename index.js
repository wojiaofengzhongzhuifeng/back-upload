const koa = require('koa')
const app = new koa()
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const path = require('path')
const cors = require('@koa/cors');
const fs = require('fs');
const {checkPathIsDir} = require('./utils/index');


console.log(11);
const router = new Router();
app.use(cors());
app.use(koaBody({
  // 支持文件格式
  multipart: true,
  formidable: {
    // 上传目录
    uploadDir: path.join(__dirname, './public/upload'),
    // 保留文件扩展名
    keepExtensions: true,
  }
}));
app.use(koaStatic(path.join(__dirname, './public')))
app.use(router.routes());

// 获取 public/upload 目录下的所有目录
router.get('/allFolderName', ctx => {
  // 读写文件操作(异步)
  fs.readdir(path.join(__dirname, './public/upload'), (e, fileOrDirNameList)=>{
    let promiseList = [];
    fileOrDirNameList.forEach((fileOrDirName)=>{
      let fileOrDirPath = path.join(__dirname, `./public/upload/${fileOrDirName}`)
      promiseList.push(checkPathIsDir(fileOrDirPath))
    });
    Promise.all(promiseList).then((checkPathResult)=>{
      let folderNameList = [];
      checkPathResult.forEach((isDirFlag, index)=>{
        if(isDirFlag){
          folderNameList.push(fileOrDirNameList[index]);
        }
      })
      console.log('upload 目录下的目录为', folderNameList);
    });
  })
})

router.post('/upload', ctx => {
  const file = ctx.request.files.fileName || ctx.request.files.file
  const basename = path.basename(file.path)
  ctx.body = { path: `${ctx.origin}/upload/${basename}` }
})

app.listen(3003, () => {
  console.log('启动成功')
  console.log('http://localhost:3000')
});