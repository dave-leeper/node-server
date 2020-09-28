const nodemailer = require('nodemailer');
const uuidv4 = require('uuid/v4');
const I18n = require('../util/i18n');
const Log = require('../util/log');
const Registry = require('../util/registry');
const ServiceBase = require('../util/service-base.js');
const Strings = require('../util/strings');
const Authentication = require('../../private/users/authentication');

/*
Order of execution for password reset
1. /user/password/reset/request (static) - Sends a form that allows user to enter the email of the account that needs a password change.
   The form is password-reset-request.hbs. Clients can write their own form, if desired.
2. /user/password/reset/request/data (endpoints/password-reset-request.js) - Converts an email value into a user account and attaches a reset token and a reset expire time to the account.
   A link to the url that uses the token is emailed to the user.
3. /user/password/reset/reply/:token (microservices/password-reset-form.js) - Invoked by the link from step 2. Sents an HTML form that allows the user to enter a new password.
   The form is password-reset-form.hbs
4. /user/password/reset/update (microservices/password-update.js) - Updates the user's password. Sends an email notification that the update occured.
 */
class PasswordResetRequest extends ServiceBase {
  constructor(configInfo) {
    super();
    this.configInfo = configInfo;
  }

  do(req, res, next) {
    const { body } = req;
    if (!body.email) {
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_EMAIL), body.email);
      if (Log.will(Log.ERROR)) Log.error(message);
      res.status(400);
      res.send(message);
      return;
    }
    let user;
    for (let i = 0; i < Authentication.accounts.length; i++) {
      if (Authentication.accounts[i].email === body.email) {
        user = Authentication.accounts[i];
        break;
      }
    }
    if (!user) {
      const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_INCORRECT_EMAIL), body.email);
      if (Log.will(Log.ERROR)) Log.error(message);
      res.status(400);
      res.send(message);
      return;
    }

    const token = uuidv4();
    const userAccount = Registry.getUserAccount(user.username);
    userAccount.resetPasswordToken = token;
    userAccount.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'magicjtv@gmail.com',
        pass: '0212Today',
      },
    });
    const msg = {
      to: userAccount.email,
      from: 'magicjtv@gmail.com',
      subject: 'Password Reset',
      text: `${'You are receiving this because you (or someone else) have requested the reset of the password for your U.S. Comics account.\n\n'
            + 'Please click on the following link, or paste this into your browser to complete the process:\n\n'
            + 'http://'}${req.headers.host}/user/password/reset/reply/${token}\n\n`
            + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
    };
    transporter.sendMail(msg, (error, data) => {
      if (error) {
        Log.error(error);
        const message = Strings.format(I18n.get(Strings.ERROR_MESSAGE_SEND_EMAIL_FAILED), error);
        if (Log.will(Log.ERROR)) Log.error(message);
        res.status(400);
        res.send(message);
        return;
      }
      res.status(200);
      res.send('Password reset email has been sent.');
    });
  }
}
module.exports = PasswordResetRequest;
