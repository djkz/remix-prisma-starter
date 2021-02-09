import { Loader, redirect } from "@remix-run/data";
import { Meta, Scripts, Styles, useRouteData } from "@remix-run/react";
import { Auth } from "./domain/auth";
import { Outlet } from "react-router-dom";
import React, { useContext } from "react";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import theme from "./components/theme";
import Header from "./components/header";
import { UserPersonalData } from "./domain/base";

export default function Root() {
  const { currentUser } = useRouteData();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        ></meta>
        <Meta />
        <Styles />
      </head>
      <body>
        <ChakraProvider theme={theme}>
          <Flex
            direction="column"
            align="center"
            maxW={{ xl: "1200px" }}
            m="0 auto"
          >
            <CurrentUserOutlet currentUser={currentUser} />
          </Flex>
        </ChakraProvider>
        <Scripts />
      </body>
    </html>
  );
}

export let loader: Loader = async ({ context, request }) => {
  const auth = new Auth({ context });
  let currentUser = await auth.currentUser();
  const loggedOutPaths = [
    "/users/login",
    "/users/signup",
    "/users/reset_password",
  ];

  let path = new URL(request.url).pathname;
  if (path.match(/\/users\/reset_password\/.+/)) path = "/users/reset_password";
  const isAuthPath = loggedOutPaths.includes(path);

  // redirect logged out users to the login url
  if (!currentUser && !isAuthPath) return redirect("/users/login");
  // redirect logged in users from the auth paths
  if (currentUser && isAuthPath) return redirect("/");

  return { currentUser };
};

export function ErrorBoundary({ error }: { error: Error }) {
  console.log(error);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Oops!</title>
      </head>
      <body>
        <div>
          <h1>App Error!</h1>
          <pre>{error.message}</pre>
          <p></p>
        </div>

        <Scripts />
      </body>
    </html>
  );
}

// setup a root context
// for passing down any application wide data
const RootContext = React.createContext<CurrentUserI>({
  currentUser: null,
});

// pass current user data to childrens context
type CurrentUser = UserPersonalData | null;
interface CurrentUserI {
  currentUser: CurrentUser;
}

export function useCurrentUser(): UserPersonalData {
  const context = useContext(RootContext);
  return context.currentUser!;
}

// only pass current user when user is logged in
const CurrentUserOutlet = ({ currentUser }: CurrentUserI) => {
  if (!currentUser) return <Outlet />;

  return (
    <>
      <Header name={currentUser.name!} />
      <RootContext.Provider value={{ currentUser }}>
        <Outlet />
      </RootContext.Provider>
    </>
  );
};
