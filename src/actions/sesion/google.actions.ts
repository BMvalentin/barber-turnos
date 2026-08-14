"use server";

import { signIn } from "@/auth";

export const googleLoginAction = async () => signIn("google", { redirectTo: "/dashboard" });
