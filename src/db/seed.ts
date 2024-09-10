import dayjs from "dayjs"
import { client, db } from "./index"
import { goals, goalsCompletions } from "./schema"

async function seed() {
  await db.delete(goalsCompletions)
  await db.delete(goals)

  const result = await db
    .insert(goals)
    .values([
      { title: "Acordar cedo", desiredWeeklyFrequency: 5 },
      { title: "Me exercitar", desiredWeeklyFrequency: 3 },
      { title: "Estudar programação", desiredWeeklyFrequency: 4 },
    ])
    .returning()

  const startOfWeek = dayjs().startOf("week")

  await db.insert(goalsCompletions).values([
    { goalId: result[0].id, createdAt: startOfWeek.toDate() },
    { goalId: result[1].id, createdAt: startOfWeek.add(1, "day").toDate() },
  ])
}

seed()
  .then(() => {
    console.log("Database seeded!")
  })
  .finally(() => {
    client.end()
  })
