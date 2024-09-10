import dayjs from "dayjs"
import { db } from "../db"
import { goals, goalsCompletions } from "../db/schema"
import { between, count, eq, lte, sql } from "drizzle-orm"

export async function getWeekPendingGoalsFn() {
  const firstDayOfWeek = dayjs().startOf("week").toDate()
  const lastDayOfWeek = dayjs().endOf("week").toDate()

  const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalCompletionCount = db.$with("goal_completition_count").as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionCount: count(goalsCompletions.id).as("completion_count"),
      })
      .from(goalsCompletions)
      .where(between(goalsCompletions.createdAt, firstDayOfWeek, lastDayOfWeek))
      .groupBy(goalsCompletions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount:
        sql`COALESCE(${goalCompletionCount.completionCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompletionCount,
      eq(goalCompletionCount.goalId, goalsCreatedUpToWeek.id)
    )

  return { pendingGoals }
}
