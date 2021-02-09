import { Action, redirect } from "@remix-run/data";

export let action: Action = async ({ context }) => {
  context.session.set("current_user", null);
  return redirect("/users/login");
};

export default function Logout() {
  return null;
}
