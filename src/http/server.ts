import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import { createGoal } from "./routes/create-goal"
import { getWeekPendingGoals } from "./routes/get-week-pending-goals"

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoal)
app.register(getWeekPendingGoals)

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running...")
})
