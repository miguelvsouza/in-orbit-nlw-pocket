import { FastifyInstance } from "fastify"
import { getWeekPendingGoalsFn } from "../../functions/get-week-pending-goals-fn"

export async function getWeekPendingGoals(app: FastifyInstance) {
  app.get("/pending-goals", async (_, reply) => {
    const { pendingGoals } = await getWeekPendingGoalsFn()

    return reply.status(200).send({ pendingGoals })
  })
}
