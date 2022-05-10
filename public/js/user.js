(() => {

  function refreshCaptcha() {
    $.ajax({
      url: './captcha',
      dataType: 'html',
      type: 'GET',
      success: (data) => {
        let c = $('.captcha-container');
        c.empty();
        c.prepend(data);
      }
    });
  }

  $('.captcha-container').on('click', refreshCaptcha);

  $(() => {
    function toggleSigninPanel() {
      $('#signin-popup').toggle();
      $('.overlay').toggle();

      if ($('#signin-popup').is(':visible')) {
        refreshCaptcha();
      }
    }

    function showSigninError(msg) {
      $('#lp-error').text(msg);
    }

    function clearSigninError() {
      showSigninError('');
    }

    $('#lp-close-btn').on('click', () => {
      toggleSigninPanel();
    });

    $('#signin-popup').on('keypress', ev => {
      if (ev.keyCode == 13) {
        $('#lp-signin').click();
        ev.preventDefault();
      }
    });

    $('#signin').on('click', () => {
      toggleSigninPanel();
    })

    $('#lp-signin').on('click', () => {
      clearSigninError();

      let uname = $('#lp-uname').val();
      if (!uname || uname.trim() == '') {
        showSigninError('用户名不能为空!');
        $('#lp-uname').focus();
        return;
      }

      let pw = $('#lp-pw').val();
      if (!pw || pw.trim() == '') {
        showSigninError('密码不能为空!');
        $('#lp-pw').focus();
        return;
      }

      let captcha = $('#lp-captcha').val();
      if (!captcha) {
        showSigninError('请输入验证码！');
        $('#lp-captcha').focus();
        return;
      }
      captcha = captcha.toLowerCase();

      $.post(
        'signin',
        {uname: uname, pw: pw, captcha: captcha},
        callback,
      ).fail(() => {
        showSigninError('请求失败');
      })
    });

    function callback(ret) {
      console.log(ret);
      if (ret) {
        if (ret.code) {
          showSigninError(ret.message);
        } else {
          window.location.reload();
        }
      }
    }
  })

  $(() => {
    // signup
    function showSignupError(msg) {
      $('#rp-error').text(msg);
    }

    function clearSignupError() {
      showSignupError('');
    }

    function toggleSignupPanel() {
      $('#signup-popup').toggle();
      $('.overlay').toggle();

      if ($('#signup-popup').is(':visible')) {
        refreshCaptcha();
      }
    }

    $('#rp-close-btn').on('click', () => {
      toggleSignupPanel();
    });

    $('#signup-popup').on('keypress', ev => {
      if (ev.keyCode == 13) {
        $('#rp-signup').click();
        ev.preventDefault();
      }
    });

    $('#signup').on('click', () => {
      toggleSignupPanel();
    })

    $('#rp-signup').on('click', () => {
      clearSignupError();

      let uname = $('#rp-uname').val();
      let re = /^[a-zA-Z0-9]{6,16}$/
      if (!uname || !re.test(uname)) {
        showSignupError('用户名由6-16位大小写字母、数字组成！');
        $('#rp-uname').focus();
        return;
      }

      let pw = $('#rp-pw').val();
      if (!pw || !re.test(pw)) {
        showSignupError('密码由6-16位大小写字母、数字组成！');
        $('#rp-pw').focus();
        return;
      }

      let pw2 = $('#rp-pw2').val();
      if (pw != pw2) {
        showSignupError('密码不一致！');
        $('#rp-pw2').focus();
        return;
      }

      let captcha = $('#rp-captcha').val();
      if (!captcha) {
        showSignupError('请输入验证码！');
        $('#rp-captcha').focus();
        return;
      }
      captcha = captcha.toLowerCase();

      $.post(
        'signup',
        {uname: uname, pw: pw, captcha: captcha},
        (ret) => {
          console.log(ret);
          if (ret) {
            if (ret.code) {
              showSignupError(ret.message);
            } else {

            }
          }
        },
      ).fail(() => {
        showSignupError('请求失败');
      })

    });
  })

  $(() => {
    function callback(ret) {
      if (ret) {
        if (!ret.code) {
          $('#uname').text(ret.data.uname);
          $('.signin').show();
          $('.not-signin').hide();
        } else {
          $('.signin').hide();
          $('.not-signin').show();
        }
      }
    }

    $.post(
      'info',
      {},
      callback
    )

    $('#signout').on('click', () => {
      $.post(
        'signout',
        {},
        () => {
          window.location.reload();
        }
      )
    });
  })
})();
