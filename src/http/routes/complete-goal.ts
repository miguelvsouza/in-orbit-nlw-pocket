import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { z } from "zod"
import { completeGoalFn } from "../../functions/complete-goal-fn"

export async function completeGoal(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/complete-goal",
    {
      schema: {
        body: z.object({
          goalId: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { goalId } = request.body

      await completeGoalFn({ goalId })

      return reply.status(200).send()
    }
  )
}
