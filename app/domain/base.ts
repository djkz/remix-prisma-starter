import { Prisma, PrismaClient } from "@prisma/client";
import { AppLoadContext } from "@remix-run/core"
import Mail from "nodemailer/lib/mailer";

export interface LoaderParams {
  context: AppLoadContext
}

export type UserPersonalData = Prisma.UserGetPayload<{
  select: { id: true, email: true; name: true }
}>

export class Base {
  private context: AppLoadContext

  current_user: string | undefined;
  prisma: PrismaClient
  transport: Mail

  constructor(loaderParams: LoaderParams) {
    this.context = loaderParams.context
    this.prisma = this.context.prisma;
    this.transport = this.context.transport

    this.current_user = this.context.session.get("current_user")
  }

  public async currentUser(): Promise<UserPersonalData | null> {
    if (!this.current_user) return null
    try {
      let user = await this.prisma.user.findFirst({
        where: { id: parseInt(this.current_user) }, select: {
          email: true,
          name: true,
          id: true
        }
      })
      if (!user) return null

      return user
    } catch (error) {
      // ignore session if the current_user is invalid
      return null;
    }
  }
}