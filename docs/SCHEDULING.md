# Schedule rules

`resolveSchedule(activations, exceptions, date)` is the single calendar resolver used by Home and rest previews. Local dates use YYYY-MM-DD; day arithmetic uses UTC noon, so elapsed calendar days do not depend on DST duration.

An activation snapshots a cycle and start position. Each calendar day advances the position. A Keep exception substitutes rest for that date without moving future positions. A Shift exception pauses advancement on that date. Multiple shifts accumulate; removing one reverses its effect. Exceptions are scoped to their activation and do not cross program transitions.

Program activation starts today unless there is a session dated today or later, in which case it begins tomorrow. An ongoing session must be finished first. Replacing an unstarted same-date activation is allowed; completed history is protected. Users choose their initial cycle position manually.

Implemented: rolling cycles, including week-sized patterns and two-week A/B patterns. Not yet implemented: independent fixed-weekday rules, asynchronous completion-driven cycles, availability calendars, Change Day, multiple sessions per date, periodization and smart transition recommendations.

Rest controls only change today/future dates without session history. Weekly quests and analytics read actual recorded completions. Rest is never a failed workout or an XP penalty.
