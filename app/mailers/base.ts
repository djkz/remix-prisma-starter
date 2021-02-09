import { AppLoadContext } from "@remix-run/core"
import Mail from "nodemailer/lib/mailer";

export interface MailerParams {
  context: AppLoadContext
}

export class Base {
  private context: AppLoadContext

  transport: Mail

  constructor(mailerParams: MailerParams) {
    this.context = mailerParams.context
    this.transport = this.context.transport
  }

  protected async sendMail(params: Mail.Options) {
    return await this.transport.sendMail(params);
  }
}