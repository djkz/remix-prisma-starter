import { Base, UserPersonalData } from "../base";
import bcrypt from "bcrypt"
import crypto from "crypto"

export class Auth extends Base {

  public async login(email: string, password: string): Promise<number | null> {
    let user = await this.prisma.user.findFirst({ where: { email } })
    if (!user) return null

    if (!await this.checkPassword(password, user.password)) return null

    return user.id
  }

  public async createUser(name: string, email: string, password: string, passwordConfirmation: string): Promise<number | Error> {
    let user

    if (password !== passwordConfirmation) {
      return new Error("Password confirmation doesn't match")
    }

    if (!name || !email || !password) {
      return new Error("All fields need to be filled out")
    }

    try {
      user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: await this.hashPassword(password)
        },
      });
    } catch (e) {
      let error = "Error Creating User";
      if (e.code === "P2002") error += ": Unique Email Required";
      return new Error(error)
    }
    return user.id
  }

  public async createPasswordResetToken(email: string): Promise<string | null> {

    let user = await this.prisma.user.findFirst({ where: { email }, include: { PasswordReset: true } })
    if (!user) return null

    let token = crypto.randomBytes(20).toString("hex")

    await this.prisma.user.update({
      where: { id: user.id }, data: {
        PasswordReset: {
          upsert: {
            create: { token },
            update: { token }
          }
        }
      }
    })

    return token
  }

  public async getUserFromPasswordResetToken(token: string): Promise<UserPersonalData | null> {

    let user = await this.prisma.user.findFirst({
      where: { PasswordReset: { token } }, select: {
        email: true,
        name: true,
        id: true
      }
    })
    if (!user) return null

    return user
  }

  // reset user password and return id of reset user
  public async setUserPasswordByToken(token: string, password: string): Promise<number | null> {

    let user = await this.getUserFromPasswordResetToken(token)
    if (!user) return null

    user = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: await this.hashPassword(password),
        PasswordReset: {
          delete: true
        }
      },
    });
    return user.id
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
  }

  private async checkPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }
}