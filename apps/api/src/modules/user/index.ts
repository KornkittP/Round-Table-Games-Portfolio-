import { Elysia } from "elysia"
import { authPlugin } from "../auth/index.js"
import { MeModel } from "./models.js"

export const userModule = new Elysia({ prefix: "/users" }).use(authPlugin).get(
  "/me",
  ({ user }) => user,
  {
    response: { 200: MeModel.responseSchema },
    detail: {
      summary: "Get current user",
      description: "The signed-in user. Created on first call. Use it to learn the role.",
      tags: ["User"]
    }
  }
)
