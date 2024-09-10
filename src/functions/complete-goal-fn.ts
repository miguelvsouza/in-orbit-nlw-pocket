import { and, between, count, eq, sql } from "drizzle-orm"
import { db } from "../db"
import { goals, goalsCompletions } from "../db/schema"
import dayjs from "dayjs"

interface CompleteGoalRequest {
  goalId: string
}

export async function completeGoalFn({ goalId }: CompleteGoalRequest) {
  const firstDayOfWeek = dayjs().startOf("week").toDate()
  const lastDayOfWeek = dayjs().endOf("week").toDate()

  const goalCompletions = await db
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount: sql`COALESCE(${count(goalsCompletions.id)}, 0)`.mapWith(
        Number
      ),
    })
    .from(goals)
    .leftJoin(
      goalsCompletions,
      and(
        eq(goalsCompletions.goalId, goalId),
        between(goalsCompletions.createdAt, firstDayOfWeek, lastDayOfWeek)
      )
    )
    .where(eq(goals.id, goalId))
    .groupBy(goals.desiredWeeklyFrequency)

  if (goalCompletions.length === 0) {
    throw new Error(
      "It is not possible to complete a goal that has not been previously registered."
    )
  }

  const { completionCount, desiredWeeklyFrequency } = goalCompletions[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error("Goal already completed in this week!")
  }

  const [completeGoal] = await db
    .insert(goalsCompletions)
    .values({ goalId })
    .returning()

  return { completeGoal }
}
