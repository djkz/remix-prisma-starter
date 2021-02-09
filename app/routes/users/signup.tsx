import { Stack, Box, Link } from "@chakra-ui/react";
import { Action, Loader, redirect } from "@remix-run/data";
import { Link as RLink, useRouteData } from "@remix-run/react";
import React from "react";
import { ActiveForm, InputField } from "../../components/form";
import { Auth } from "../../domain/auth";

interface SignUpI {
  signUpError: string | undefined;
}

export default function SignUp() {
  const { signUpError }: SignUpI = useRouteData();

  return (
    <Stack spacing={3} minW={380} maxW={500}>
      <Box textStyle="h2">Sign Up</Box>
      <ActiveForm
        action="/users/signup"
        label="Sign Up"
        error={signUpError}
        secondaryButton={
          <Link as={RLink} to="/users/login">
            Login
          </Link>
        }
      >
        <InputField name="name" label="Full Name" />
        <InputField name="email" label="Email Address" />
        <InputField name="password" label="Password" type="password" />
        <InputField
          name="password_confirmation"
          label="Password"
          type="password"
        />
      </ActiveForm>
    </Stack>
  );
}

export let loader: Loader = async ({ context }): Promise<SignUpI> => {
  let session = context.session;
  const signUpError = session.get("signUpError");
  return { signUpError };
};

export let action: Action = async ({ context, request }) => {
  let body = new URLSearchParams(await request.text());
  let auth = new Auth({ context });
  let session = context.session;

  let name = body.get("name") as string;
  let email = body.get("email") as string;
  let password = body.get("password") as string;
  let password_confirmation = body.get("password_confirmation") as string;

  let result = await auth.createUser(
    name,
    email,
    password,
    password_confirmation
  );

  if (result instanceof Error) {
    session.flash("signUpError", result.message);
    return redirect("/users/signup");
  }

  session.set("current_user", result.toString());
  return redirect("/");
};
