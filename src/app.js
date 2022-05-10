import Koa from 'koa';
import KoaBody from 'koa-body';
import KoaStatic from 'koa-static';
import KoaViews from 'koa-views';
import KoaSession from 'koa-session';
import path from 'path';

import config from './config.js';
import logger from './logger.js';
import './db.js';
import routers from './routes/routes.js';

(async function () {

  const env = process.env.NODE_ENV || 'development'; // current mode

  const app = new Koa();
  app.keys = ['noevil koa site'];

  if (env === 'development') {
    app.use((ctx, next) => {
      const start = new Date()
      return next().then(() => {
        const ms = new Date() - start
        logger.info(`${ctx.status} ${ctx.method} ${ctx.url} - ${ms}ms`)
      })
    })
  }

  app
    .use((ctx, next) => {
      if (ctx.request.header.host.split(':')[0] === 'localhost' || ctx.request.header.host.split(':')[0] === '127.0.0.1') {
        ctx.set('Access-Control-Allow-Origin', '*')
      } else {
        ctx.set('Access-Control-Allow-Origin', config.host)
      }
      ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
      ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
      ctx.set('Access-Control-Allow-Credentials', true)
      return next()
    })
    .use(async (ctx, next) => {
      // handle error status code
      try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
          ctx.throw(404);
        }
      } catch (err) {
        ctx.status = err.status || 500
        if (Math.floor(ctx.status / 10) === 40) {
          await ctx.render('404');
        } else {
          console.log(err);
          await ctx.render('50x');
        }
      }
    })
    .use(KoaViews(config.webroot, {extension: 'html'}))
    .use((ctx, next) => {
      if (ctx.path.endsWith('html')) {
        ctx.throw(404);
      } else {
        return next();
      }
    })
    .use(KoaStatic(config.webroot)) // Static resource
    // .use(jwt({ secret: publicKey }).unless({ path: [/^\/public|\/user\/login|\/assets/] }))
    .use(KoaBody({
      multipart: true, parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'], // parse GET, HEAD, DELETE requests
      formidable: {
        uploadDir: path.join(config.webroot, '/uploads/tmp')
      }, jsonLimit: '10mb', formLimit: '10mb', textLimit: '10mb'
    }))

  const CONFIG = {
    key: 'nosess', /** (string) cookie key (default is koa.sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    autoCommit: true,
    /** (boolean) automatically commit headers (default true) */
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
    renew: false,
    /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    secure: process.env.NODE_ENV === "production",
    /** (boolean) secure cookie*/
    sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
  };

  app.use(KoaSession(CONFIG, app));

  // routers
  app.use(routers.routes())

  app.listen(config.port);
  logger.info("webroot:" + config.webroot, "port:" + config.port, "env:" + env);

})();
