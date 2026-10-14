import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";

export default async function HackerApplicationPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/sign-in?callbackUrl=/apply");
  if (user.status !== "not_applied") redirect("/apply/review");
  redirect("/apply");
}
