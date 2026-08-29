#!/usr/bin/env python3
"""Point a Postgres URL at 127.0.0.1:PORT. Splits userinfo on the last @."""

from __future__ import annotations

import re
import sys


def rewrite_pg_url(url: str, port: str) -> str:
    url = url.strip()
    scheme, sep, rest = url.partition("://")
    if not sep:
        raise ValueError("invalid DATABASE_URL: missing ://")
    at = rest.rfind("@")
    if at < 0:
        raise ValueError("invalid DATABASE_URL: missing @host")
    userinfo, hostpath = rest[:at], rest[at + 1 :]
    pathq = re.sub(r"^[^/?]+", f"127.0.0.1:{port}", hostpath, count=1)
    return f"{scheme}://{userinfo}@{pathq}"


def main() -> int:
    if len(sys.argv) != 3:
        sys.stderr.write("usage: rewrite-pg-url.py URL PORT\n")
        return 2
    try:
        sys.stdout.write(rewrite_pg_url(sys.argv[1], sys.argv[2]))
    except ValueError as err:
        sys.stderr.write(f"error: {err}\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
