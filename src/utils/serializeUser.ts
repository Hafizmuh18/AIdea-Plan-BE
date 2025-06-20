import { User } from "@prisma/client";

export function serializeUser(user: User, loginType: "google" | "manual") {
  return {
    id: user.id,
    email: user.email,
    name: user.name || "User",
    image: user.image || null,
    loginType,
  };
}
