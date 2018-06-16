const Koa = require('koa')
const Router = require('koa-router')
const render = require('koa-ejs')
const path = require('path')
const koaBody = require('koa-body')

const app = new Koa()
const router = new Router()

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'template',
  viewExt: 'ejs',
  cache: false
})

async function signinGetHandler (ctx) {
  await ctx.render('signin')
}

function signinPostHandler (ctx) {
  console.log('username: ', ctx.request.body.username)
  console.log('password: ', ctx.request.body.password)
  ctx.redirect('/signin')
}

router.get('/', ctx => {
  ctx.body = `<a href="/signin">goto signin page</a>`
})
router.get('/signin', signinGetHandler)
router.post('/signin', signinPostHandler)

app.use(koaBody())
app.use(router.routes())
app.use(router.allowedMethods())

app.listen(3000)
