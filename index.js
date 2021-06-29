const koa = require('koa')
const app = new koa()
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const path = require('path')
const cors = require('@koa/cors');
const fs = require('fs');
const {
  getFolderAllFolderNameList,
  Response,
  createFolderInUploadFolder,
  uploadDir,
  tempDir,
  removeAllFileAndFolder,
  getFolderAllFileNameList,
  appDir,
  zipFolder,
  removeOldZipFile,
  ARCHIVE_LIST,
  checkPathHasSubContent,
  checkPathIsDir,
  unzip,
  getFileAndFolderName,
} = require('./utils/index');

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
  },
  maxFieldsSize: 1000 * 1024 * 1024
}));
app.use(koaStatic(path.join(__dirname, './public')))
app.use(router.routes());







router.get('/test', async ctx => {
  //
  // const test1 = await unzip(
  //   path.join(uploadDir, '/raojiajun') + `/学号抽取.zip`,
  //   path.join(uploadDir, '/raojiajun')
  //   );

  ctx.body = {message: Math.random()}
})

router.post('/folderSubContentList', async ctx => {
  let folderNameList = ctx.request.body.folderName;
  let folderNamePath = folderNameList.join('/')
  const fileOrFolderList = await getFileAndFolderName(path.join(appDir, `./public/upload/${folderNamePath}`));
  let promiseList = fileOrFolderList.map(async (fileOrFolderName)=>{
    const fileOrFolderItem = {name:fileOrFolderName, isDir: false, hasChildren: false}
    const fileOrFolderPath = path.join(appDir, `./public/upload/${folderNamePath}`, fileOrFolderName);
    const isDir = await checkPathIsDir(fileOrFolderPath);
    if(isDir){
      const dirHasSubContent = await checkPathHasSubContent(fileOrFolderPath);
      fileOrFolderItem.isDir = true;
      fileOrFolderItem.hasChildren = dirHasSubContent;
    } else {
      fileOrFolderItem.isDir = false;
      fileOrFolderItem.hasChildren = false;
    }
    return fileOrFolderItem
  });

  const result = await Promise.all(promiseList).then((resolve, reject)=>{
    return resolve
  });



  ctx.body = new Response({message: '成功', code: 200, data: result})
})

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
  upStream.on('finish', async ()=>{
    // fixme 应该等待 unzip 之后, 才返回数据
    // 只有生成 zip 之后,才进行解压缩操作
    // 判断是否为 zip, 如果是的话, 使用工具解压缩,将压缩内容放入到相应目录
    if(ARCHIVE_LIST.includes(file.type)){
      await unzip(
        path.join(uploadDir, `/${folderName}`) + `/${fileName}`,
        path.join(uploadDir, `/${folderName}/`)
      );
    }
  })

  reader.pipe(upStream);
  removeAllFileAndFolder(tempDir);
  ctx.body = { path: `${ctx.origin}/upload/${folderName}/${fileName}` }
})


router.get('/zip', async ctx => {
  const {folderName} = ctx.request.query
  const oldZipFilePath = path.join(uploadDir, `./tempZip/${folderName}.zip`)
  await removeOldZipFile(oldZipFilePath);

  await zipFolder(folderName);
  ctx.body = {message: '成功', code: 200, data:`${ctx.origin}/upload/tempZip/${folderName}.zip` }
});

router.get('/allPerson', async ctx => {
  const allFolderName = await getFolderAllFolderNameList('./public/upload');
  const allPerson = allFolderName.filter((folderName)=>{
    return !(folderName === 'temp' || folderName === 'tempZip');
  });
  ctx.body = {message: '成功', code: 200, data: allPerson }
});




app.listen(7778, () => {
  console.log('启动成功')
  console.log('http://localhost:3000')
});
