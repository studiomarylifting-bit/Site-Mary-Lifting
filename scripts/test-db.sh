#!/usr/bin/env bash
# Testa migrations, seed, RLS e políticas de Storage em um PostgreSQL DESCARTÁVEL.
#
#   createdb catalogo_test
#   TEST_DATABASE_URL=postgresql:///catalogo_test npm run test:db
#   dropdb catalogo_test
#
# Cria stubs do que o Supabase fornece (auth, storage, roles) e aplica as migrations
# reais. NUNCA aponte para o projeto Supabase de verdade: o script recusa URLs do Supabase.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${TEST_DATABASE_URL:?Defina TEST_DATABASE_URL apontando para um banco vazio e descartável}"
case "$TEST_DATABASE_URL" in
  *supabase.co*|*supabase.com*|*pooler*) echo "RECUSADO: parece um banco do Supabase. Use um PostgreSQL local descartável." >&2; exit 2 ;;
esac

run() { psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }

run -f tests/db/supabase_stub.sql
for m in supabase/migrations/*.sql; do echo "migration: $m"; run -f "$m" >/dev/null; done
echo "reaplicando as migrations do catálogo (idempotência)"; for m in supabase/migrations/20261122*.sql; do run -f "$m" >/dev/null 2>&1; done
run -f supabase/seed.sql >/dev/null; run -f supabase/seed.sql >/dev/null   # 2x: não pode duplicar

out="$(psql "$TEST_DATABASE_URL" -q -f tests/db/catalog_rls.sql -f tests/db/site_images_rls.sql 2>&1 | sed -n 's/^psql:[^ ]* NOTICE:  //p')"
echo "$out"
pass=$(grep -c '^PASS' <<<"$out" || true); fail=$(grep -c '^FAIL' <<<"$out" || true)
echo; echo "RLS/Storage: $pass aprovados, $fail falhas"
[ "$fail" -eq 0 ] && [ "$pass" -gt 0 ]
