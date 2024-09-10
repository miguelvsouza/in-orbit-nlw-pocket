import fastify from "fastify"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import { createGoal } from "./routes/create-goal"
import { getWeekPendingGoals } from "./routes/get-week-pending-goals"
import { completeGoal } from "./routes/complete-goal"
import { getWeekSummary } from "./routes/get-week-summary"

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createGoal)
app.register(getWeekPendingGoals)
app.register(completeGoal)
app.register(getWeekSummary)

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running...")
})
