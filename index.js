const koa = require('koa')
const app = new koa()
const Router = require('koa-router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const path = require('path')
const cors = require('@koa/cors');


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



router.post('/upload', ctx => {
  const file = ctx.request.files.fileName || ctx.request.files.file
  const basename = path.basename(file.path)
  ctx.body = { path: `${ctx.origin}/upload/${basename}` }
})

app.listen(3003, () => {
  console.log('启动成功')
  console.log('http://localhost:3000')
});