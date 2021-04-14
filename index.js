const koa = require('koa')
const app = new koa()
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const path = require('path')
const cors = require('@koa/cors');
const fs = require('fs');
const {getFolderAllFolderNameList, Response, createFolderInUploadFolder, uploadDir, tempDir, removeAllFileAndFolder, getFolderAllFileNameList} = require('./utils/index');

console.log(11);
const router = new Router();
app.use(cors());
app.use(koaBody({
  // 支持文件格式
  multipart: true,
  formidable: {
    // 上传目录
    uploadDir: path.join(__dirname, './public/upload/temp'),
    // 保留文件扩展名
    keepExtensions: true,
  }
}));
app.use(koaStatic(path.join(__dirname, './public')))
app.use(router.routes());

// 获取 public/upload 目录下的所有目录
router.get('/allFolderName', async ctx => {
  let folderNameList = await getFolderAllFolderNameList('./public/upload');

  const response = new Response({data: folderNameList, message: '成功', code: 200})

  ctx.body = response
})

// 在 public/upload 目录生成新目录
router.post('/folderName', async ctx => {
  const newFolderName = ctx.request.body.folderName;
  let folderNameList = await getFolderAllFolderNameList('./public/upload');
  if(!newFolderName){
    ctx.body = new Response({data: null, message: '请输入目录名称', code: 403});
    return
  }
  if(folderNameList.includes(newFolderName)){
    ctx.body = new Response({data: null, message: '该目录名称已经存在', code: 403})
    return;
  }

  const result = await createFolderInUploadFolder(newFolderName);
  ctx.body = result
})

router.post('/upload', async ctx => {
  const file = ctx.request.files.fileName || ctx.request.files.file;
  const folderName = ctx.request.body.folderName;
  const reader = fs.createReadStream(file.path);
  let filePath;
  let fileName;

  // 1. 判断文件名称是否重复,如果重复的话, 文件名称添加时间戳
  let allFileNameList = await getFolderAllFileNameList(`./public/upload/${folderName}`);
  if(allFileNameList.includes(file.name)){
    fileName = `${Math.random()}_${file.name}`;
    filePath = path.join(uploadDir, folderName) + `/${fileName}`;
  } else {
    fileName = `${file.name}`;
    filePath = path.join(uploadDir, folderName) + `/${fileName}`
  }

  // 将文件写入
  const upStream = fs.createWriteStream(filePath);
  reader.pipe(upStream);
  removeAllFileAndFolder(tempDir);

  ctx.body = { path: `${ctx.origin}/upload/${folderName}/${fileName}` }
})

app.listen(3003, () => {
  console.log('启动成功')
  console.log('http://localhost:3000')
});