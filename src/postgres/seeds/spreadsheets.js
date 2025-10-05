/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    await knex("spreadsheets")
        .insert([
            { id: "1pjdKhlCLETjKFT0tdgpqFFrcDn2KJtjn0G6MqJ3Qd_M" },
            { id: "1lsMn2BZ7HmECM0Q29g84tr_dehkbQet6YhP-C4l8rO0" },
            { id: "1jFzuwkqG9ghYr0RF1XffMi0kKxUkWszGkGk0BiHl9vo" },
        ])
        .onConflict(["id"])
        .ignore();
}
