import { Action, Loader, redirect } from "@remix-run/data";
import { Auth } from "../../../domain/auth";
import { Box, Stack } from "@chakra-ui/react";
import { ActiveForm, InputField } from "../../../components/form";
import { useRouteData } from "@remix-run/react";

export default function Token() {
  let { user, token, resetError } = useRouteData();
  if (!user) return <div>Token is invalid or expired</div>;
  return (
    <Stack spacing={3} minW={380} maxW={500}>
      <Box textStyle="h2">Set New Password</Box>
      <ActiveForm
        action={`/users/reset_password/${token}`}
        label="Set New Password"
        error={resetError}
      >
        <InputField
          name="email"
          label="Email Address"
          value={user.email}
          readOnly
        />
        <InputField name="password" label="Password" type="password" />
      </ActiveForm>
    </Stack>
  );
}

export let loader: Loader = async ({ params, context }) => {
  const auth = new Auth({ context });
  let session = context.session;

  let user = await auth.getUserFromPasswordResetToken(params.token);

  const resetError = session.get("resetError");

  return {
    token: params.token,
    user,
    resetError,
  };
};

export let action: Action = async ({ params, context, request }) => {
  const auth = new Auth({ context });
  let session = context.session;
  let body = new URLSearchParams(await request.text());
  let password = body.get("password");
  let token = params.token;

  if (!password) {
    session.flash("resetError", "Valid password required");
    return redirect(request.url);
  }

  let userId = await auth.setUserPasswordByToken(token, password);

  if (!userId) {
    session.flash("resetError", "Could not reset your password");
    return redirect(request.url);
  }

  session.set("current_user", userId.toString());
  return redirect("/");
};
