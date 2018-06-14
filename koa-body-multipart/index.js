const Koa = require('koa')
const Router = require('koa-router')
const render = require('koa-ejs')
const path = require('path')
const koaBody = require('koa-body')
const uuidv4 = require('uuid/v4')
const fs = require('fs-extra')

const app = new Koa()
const router = new Router()

const pictureDir = path.join(__dirname, 'public', 'images')

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'template',
  viewExt: 'ejs',
  cache: false
})

const allowFileType = {
  'image/png': true,
  'image/jpeg': true
}
const uploadHandler = async ctx => {
  try {
    if (!allowFileType[ctx.request.files.photo.type]) {
      throw new Error('file type not allow')
    }
    console.log(ctx.request.body.caption)
    console.log(ctx.request.body.detail)
    console.log(ctx.request.files.photo.name)
    console.log(ctx.request.files.photo.path)
    const fileName = uuidv4()
    await fs.rename(ctx.request.files.photo.path, path.join(pictureDir, fileName))
    ctx.status = 303
    ctx.redirect('/')
  } catch (e) {
    // handle error here
    ctx.status = 400
    ctx.body = e.message
    fs.remove(ctx.request.files.photo.path)
  }
}

router.get('/', ctx => {
  ctx.body = `<a href="/upload">goto upload page</a>`
})
router.get('/upload', async ctx => {
  await ctx.render('upload')
})

router.post('/upload', koaBody({ multipart: true }), uploadHandler)

app.use(router.routes())
app.use(router.allowedMethods())

// check directory before start server
fs.ensureDir(pictureDir, () => {
  app.listen(3000)
})
