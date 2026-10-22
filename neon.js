"""Neon server-side driver for the Django Vercel entry point.

Vercel's Node.js function runtime + @neondatabase/serverless exposes a
raw PG pool suitable for a small serverless function. Django runs as the
Python WSGI app (via Vercel's official Django architecture), so this
module exists so you can reach the Neon DB from Node code (edge calls,
cron, third-party webhooks) with the same pooled connection string your
Vercel project already has:
POSTGRES_URL_NON_POOLING / DATABASE_URL
"""
import os

# Lazy import so the package installs even when the driver is not used.
def get_pool() -> object:
    """Return a parameterized Neon connection pool.

    Uses the standard Vercel env vars (neon CLI ``env pull`` writes to
    POSTGRES_URL_NON_POOLING); falls back to DATABASE_URL. Every read
    uses a NEW connection (maxUses=1) because pg-bouncer pooled connections
    go stale across Vercel warm-seconds — writes fail with 500.
    """
    from neon.node import Pool  # type: ignore

    pool_url = (
        os.environ.get("POSTGRES_URL_NON_POOLING", "")
        or os.environ.get("POSTGRES_URL", "")
        or os.environ.get("DATABASE_URL", "")
    )
    if not pool_url:
        raise RuntimeError(
            "Neon pool URL missing. Set POSTGRES_URL_NON_POOLING (or DATABASE_URL) "
            "as a Vercel environment variable."
        )
    return Pool(pool_url, maxUses=1, connectionTimeoutMillis=5000)


def query(sql: str, params=None):
    """Execute a read-only SQL statement and return all rows.

    Designed for short-lived server-side tasks (webhooks, admin scripts,
    analytics). Does not open a transaction — each call owns one connection.
    """
    if not sql.strip().upper().startswith(("SELECT", "SHOW", "EXPLAIN")):
        raise ValueError("neon_query() is read-only; use exec_sql() for writes.")
    with get_pool().connect() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            return cur.fetchall()
