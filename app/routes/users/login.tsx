import { Loader } from "@remix-run/data";
import { Link as RLink, useRouteData } from "@remix-run/react";
import { Action, redirect } from "@remix-run/data";
import { Auth } from "../../domain/auth";
import { Box, Stack, Link, Container } from "@chakra-ui/react";
import { ActiveForm, InputField } from "../../components/form";

interface LoginI {
  loginError: string | undefined;
}

export default function Login() {
  const { loginError }: LoginI = useRouteData();

  return (
    <Stack spacing={3} minW={380} maxW={500}>
      <Box textStyle="h2">Login</Box>
      <ActiveForm
        action="/users/login"
        label="Login"
        submitLabel="Logging In"
        error={loginError}
        secondaryButton={
          <Link as={RLink} to="/users/signup" className="u-pull-right">
            Sign Up
          </Link>
        }
      >
        <InputField name="email" label="Email Address" />
        <InputField name="password" label="Password" type="password" />
      </ActiveForm>
      <Container centerContent paddingTop="6">
        Forgot your password?{" "}
        <Link as={RLink} to="/users/reset_password">
          Reset
        </Link>
      </Container>
    </Stack>
  );
}

export let loader: Loader = async ({ context }): Promise<LoginI> => {
  let session = context.session;
  const loginError = session.get("loginError");

  return { loginError };
};

export let action: Action = async ({ context, request }) => {
  const auth = new Auth({ context });
  let session = context.session;
  let body = new URLSearchParams(await request.text());
  let email = body.get("email");
  let password = body.get("password");

  let user_id = await auth.login(email as string, password as string);

  if (!user_id) {
    session.flash("loginError", "invalid username or password");
    return redirect("/users/login");
  }

  session.set(
    "current_user",
    (context.session.current_user = user_id.toString())
  );

  return redirect("/");
};
