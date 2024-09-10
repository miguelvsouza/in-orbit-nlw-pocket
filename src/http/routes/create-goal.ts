import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { createGoalFn } from "../../functions/create-goal-fn"

export async function createGoal(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/goals",
    {
      schema: {
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
      },
    },
    async (request, reply) => {
      const { title, desiredWeeklyFrequency } = request.body

      const { goal } = await createGoalFn({ title, desiredWeeklyFrequency })

      return reply.status(201).send({
        goalId: goal.id,
      })
    }
  )
}
