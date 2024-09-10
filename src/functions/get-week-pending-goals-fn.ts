import dayjs from "dayjs"
import weekOfYear from "dayjs/plugin/weekOfYear"
import { db } from "../db"
import { goals, goalsCompletitions } from "../db/schema"
import { between, count, eq, lte, sql } from "drizzle-orm"

dayjs.extend(weekOfYear)

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

  const goalCompletitionCount = db.$with("goal_completition_count").as(
    db
      .select({
        goalId: goalsCompletitions.goalId,
        completionCount: count(goalsCompletitions.id).as("completion_count"),
      })
      .from(goalsCompletitions)
      .where(
        between(goalsCompletitions.createdAt, firstDayOfWeek, lastDayOfWeek)
      )
      .groupBy(goalsCompletitions.goalId)
  )

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletitionCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      completionCount:
        sql`COALESCE(${goalCompletitionCount.completionCount}, 0)`.mapWith(
          Number
        ),
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompletitionCount,
      eq(goalCompletitionCount.goalId, goalsCreatedUpToWeek.id)
    )

  return { pendingGoals }
}
