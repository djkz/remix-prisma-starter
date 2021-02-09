import { Action, redirect } from "@remix-run/data";
import { Auth } from "../../../domain/auth";
import { Box, Stack } from "@chakra-ui/react";
import { ActiveForm, InputField } from "../../../components/form";
import { ResetPasswordMailer } from "../../../mailers/users/reset_password";

export default function ResetPassword() {
  return (
    <Stack spacing={3} minW={380} maxW={500}>
      <Box textStyle="h2">Reset Password</Box>
      <ActiveForm action="/users/reset_password" label="Reset">
        <InputField name="email" label="Email Address" />
      </ActiveForm>
    </Stack>
  );
}

export let action: Action = async ({ context, request }) => {
  let session = context.session;
  let body = new URLSearchParams(await request.text());
  const auth = new Auth({ context });
  let email = body.get("email");
  if (!email) return redirect("/users/reset_password");

  let token = await auth.createPasswordResetToken(email);

  if (token) {
    const reset = new ResetPasswordMailer({ context });
    const referrer = request.url.split("?")[0];
    reset.send(email, token, referrer);
  }

  session.flash(
    "loginError",
    "We have emailed you the password reset instructions"
  );
  return redirect("/");
};
