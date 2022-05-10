import Router from 'koa-router';
import {UniqueConstraintError} from 'sequelize';
import svgCaptcha from 'svg-captcha';

import db from '../db.js';
import Validator from '../validator.js';
import Util from '../util.js';
import ResponseCode from '../responseCode.js';
import logger from '../logger.js';

const router = Router();

{
  const schema = {
    type: 'object', fields: {
      uname: {
        type: 'string', min: 5, max: 16,
      }, pw: {
        type: 'string', min: 6, max: 16,
      }, captcha: {
        type: 'string', min: 2, max: 16,
      }
    }
  };

  const validator = new Validator(schema);

  router.post('/signin', async (ctx, next) => {

    let params;
    try {
      params = validator.validate(ctx.request.body);
    } catch (err) {
      ctx.body = ResponseCode.WRONG_PARAMS;
      return;
    }

    if (params['captcha'] === ctx.session.captcha) {
      delete ctx.session.captcha;
    } else {
      ctx.body = ResponseCode.WRONG_CAPTCHA;
      return;
    }

    let row = await db.models.User.findOne({
      attributes: ['uid', 'uname', 'salt', 'pw'], where: {
        uname: params['uname'],
      }
    });

    if (!row) {
      ctx.body = ResponseCode.WRONG_PASSWORD;
      return;
    }

    const pw = Util.sha3_256(params['pw'] + row['salt']);
    if (pw !== row['pw']) {
      ctx.body = ResponseCode.WRONG_PASSWORD;
      return;
    }

    ctx.body = ResponseCode.successCode({uid: row['uid'], uname: row['uname']});

    ctx.session.auth = {};
    ctx.session.auth.user = {uid: row['uid'], uname: row['uname']};
  });
}

{
  router.post('/signout', async (ctx, next) => {
    if (ctx.session && ctx.session.auth) {
      delete ctx.session.auth;
    }

    ctx.body = ResponseCode.successCode();
  });
}

{
  router.post('/info', async (ctx, next) => {
    if (!ctx.session || !ctx.session.auth) {
      ctx.body = ResponseCode.NOT_LOGIN;
      return;
    }

    ctx.body = ResponseCode.successCode(ctx.session.auth.user);
  });
}

{
  const schema = {
    type: 'object', fields: {
      uname: {
        type: 'string', regex: '^[a-zA-Z0-9]{6,16}$',
      }, pw: {
        type: 'string', regex: '^[a-zA-Z0-9]{6,16}$',
      }, captcha: {
        type: 'string', min: 2, max: 16,
      }
    }
  };

  const validator = new Validator(schema);

  router.post('/signup', async (ctx, next) => {

    let params;
    try {
      params = validator.validate(ctx.request.body);
    } catch (err) {
      ctx.body = ResponseCode.WRONG_PARAMS;
      return;
    }

    if (params['captcha'] === ctx.session.captcha) {
      delete ctx.session.captcha;
    } else {
      ctx.body = ResponseCode.WRONG_CAPTCHA;
      return;
    }

    let cnt = await db.models.User.count({
      where: {
        uname: params['uname'],
      }
    });
    if (cnt > 0) {
      ctx.body = ResponseCode.ID_EXISTS;
      return;
    }

    let salt = Util.randStr(8);
    let pw = Util.sha3_256(params['pw'] + salt)

    try {
      await db.models.User.create({
        uname: params['uname'], salt: salt, pw: pw,
      });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        ctx.body = ResponseCode.ID_EXISTS;
        return;
      } else {
        throw err;
      }
    }

    ctx.body = ResponseCode.successCode(params);

  });
}

{
  router.get('/captcha', (ctx, next) => {
    let captcha = svgCaptcha.create({
      size: 6, noise: 2, ignoreChars: '0oO1ilI', // 排除 0oO1ilI
      color: true, background: '#ccc',
    });
    ctx.session.captcha = captcha.text.toLowerCase();

    ctx.type = 'image/svg+xml';
    ctx.body = captcha.data;
  })
}

export default router;
