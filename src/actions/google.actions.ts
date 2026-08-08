"use server";
import { signIn } from "@/auth";

export async function googleLoginAction() {
  await signIn("google", { redirectTo: "/dashboard" });
}
