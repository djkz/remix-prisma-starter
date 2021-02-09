import { Base } from "../base";

export class ResetPasswordMailer extends Base {

  public async send(email: string, token: string, referrer: string) {

    const resetEmail = {
      from: '"No Reply" <noreply@herokuapp.com>',
      to: email,
      subject: "Email Reset",
      html: `Please click on this link to reset email <a href="${referrer}/${token}">Reset Password</a>`,
    };

    this.sendMail(resetEmail);
  }
}