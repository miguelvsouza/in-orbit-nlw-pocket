import { FastifyInstance } from "fastify"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import { getWeekSummaryFn } from "../../functions/get-week-summary-fn"

export async function getWeekSummary(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/week-summary", async (_, reply) => {
      const { summary } = await getWeekSummaryFn()

      return reply.status(200).send({ summary })
    })
}
