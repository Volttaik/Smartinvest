---
name: Turso compatibility
description: Non-obvious constraints when preserving the former model-style API on Turso/libSQL.
---

The compatibility layer must normalize SQLite integer booleans at the database boundary and preserve the existing model query semantics. Simple equality filters can be translated to SQL, while operators such as `$or`, `$in`, and ranges must retain an in-memory fallback.

**Why:** SQLite stores booleans as integers, while the existing route code queries booleans and expects hydrated JavaScript records. Without explicit normalization, active packages and users can silently disappear from query results.

**How to apply:** When adding or changing model fields or filters, update both the SQL value conversion and hydrated-record comparison paths, then exercise a real route against Turso.