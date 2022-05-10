export default {
  WRONG_PARAMS: {code: 1001, message: '参数错误'},
  WRONG_PASSWORD: {code: 1002, message: '密码错误'},
  ID_EXISTS: {code: 1003, message: '账号已存在'},
  WRONG_CAPTCHA: {code: 1004, message: '验证码错误'},
  NOT_LOGIN: {code: 1005, message: '未登录'},

  successCode: (data = {}) => {
    return {code: 0, message: '', data: data};
  }
};
