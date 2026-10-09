import { redirect } from "next/navigation";
import { auth } from "./auth";
import { isAdmin } from "./roles";

/** Server-side guard for admin pages and actions (the middleware is not enough on its own). */
const requireAdmin = async () => {
  const session = await auth();
  if (!isAdmin(session?.user)) redirect("/login");
};

export default requireAdmin;
