-- Testes de RLS/Storage do catálogo. Executado por scripts/test-db.sh (a partir da raiz do repo).
\set ON_ERROR_STOP off
create schema if not exists tt;
create or replace function tt.try(r text, uid uuid, q text) returns text language plpgsql as $$
declare n int;
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid::text,''), true);
  execute format('set local role %I', r);
  execute q; get diagnostics n = row_count;
  reset role;
  return 'ok:' || n;
exception when others then
  reset role;
  return 'ERRO:' || sqlstate;
end $$;
create or replace function tt.expect(label text, got text, want text) returns void language plpgsql as $$
begin raise notice '% % -> % (esperado %)', case when got like want then 'PASS' else 'FAIL' end, label, got, want; end $$;

insert into auth.users (id,email,raw_user_meta_data) values ('00000000-0000-0000-0000-0000000000aa','admin@t','{"full_name":"Admin Teste","phone":"5511999999999"}'),('00000000-0000-0000-0000-0000000000bb','cliente@t','{"full_name":"Cliente Teste","phone":"5511988888888"}') on conflict do nothing;
insert into public.user_roles (user_id, role) values ('00000000-0000-0000-0000-0000000000aa','admin') on conflict do nothing;
\set A '''00000000-0000-0000-0000-0000000000aa'''
\set C '''00000000-0000-0000-0000-0000000000bb'''

-- ---------- leitura pública
select tt.expect('anon lê serviços ativos', tt.try('anon',null,'select 1 from services'), 'ok:23');
select tt.expect('anon lê categorias ativas', tt.try('anon',null,'select 1 from service_categories'), 'ok:4');
-- ---------- escrita bloqueada
select tt.expect('anon NÃO insere serviço', tt.try('anon',null,$q$insert into services(slug,category_slug,position,name,description,price_cents) values('x','cilios',99,'x','x',1)$q$), 'ERRO:42501');
select tt.expect('anon NÃO altera preço', tt.try('anon',null,'update services set price_cents=1'), 'ERRO:42501');
select tt.expect('anon NÃO apaga', tt.try('anon',null,'delete from services'), 'ERRO:42501');
select tt.expect('anon NÃO altera image_path', tt.try('anon',null,$q$update services set image_path='servicos/a.webp'$q$), 'ERRO:42501');
select tt.expect('cliente NÃO altera preço', tt.try('authenticated',:C,'update services set price_cents=1'), 'ERRO:42501');
select tt.expect('cliente NÃO apaga', tt.try('authenticated',:C,'delete from services'), 'ERRO:42501');
select tt.expect('cliente: update image_path não afeta nenhuma linha (RLS)', tt.try('authenticated',:C,$q$update services set image_path='servicos/a.webp'$q$), 'ok:0');
select tt.expect('ADMIN NÃO altera preço pela API (grant por coluna)', tt.try('authenticated',:A,'update services set price_cents=1'), 'ERRO:42501');
select tt.expect('ADMIN NÃO altera nome', tt.try('authenticated',:A,$q$update services set name='x'$q$), 'ERRO:42501');
select tt.expect('ADMIN NÃO apaga serviço', tt.try('authenticated',:A,'delete from services'), 'ERRO:42501');
select tt.expect('cliente NÃO se promove a admin', tt.try('authenticated',:C,$q$insert into user_roles(user_id,role) values ('00000000-0000-0000-0000-0000000000bb','admin')$q$), 'ERRO:42501');
-- ---------- image_path: admin pode, com formato válido
select tt.expect('admin define image_path válido', tt.try('authenticated',:A,$q$update services set image_path='servicos/volume-egipcio.webp' where slug='volume-egipcio'$q$), 'ok:1');
select tt.expect('rejeita URL em image_path', tt.try('authenticated',:A,$q$update services set image_path='https://evil.com/a.jpg' where slug='volume-egipcio'$q$), 'ERRO:23514');
select tt.expect('rejeita path traversal', tt.try('authenticated',:A,$q$update services set image_path='servicos/../x.png' where slug='volume-egipcio'$q$), 'ERRO:23514');
select tt.expect('rejeita pasta errada (categorias/ em serviço)', tt.try('authenticated',:A,$q$update services set image_path='categorias/a.webp' where slug='volume-egipcio'$q$), 'ERRO:23514');
select tt.expect('rejeita extensão não-imagem', tt.try('authenticated',:A,$q$update services set image_path='servicos/a.svg' where slug='volume-egipcio'$q$), 'ERRO:23514');
select tt.expect('admin pode limpar image_path (NULL)', tt.try('authenticated',:A,$q$update services set image_path=null where slug='volume-egipcio'$q$), 'ok:1');
select tt.expect('categoria aceita categorias/...', tt.try('authenticated',:A,$q$update service_categories set image_path='categorias/cilios.jpg' where slug='cilios'$q$), 'ok:1');
select tt.expect('categoria rejeita servicos/...', tt.try('authenticated',:A,$q$update service_categories set image_path='servicos/a.jpg' where slug='cilios'$q$), 'ERRO:23514');
-- ---------- ativo/inativo
update services set active=false where slug='fox-easy';
select tt.expect('anon NÃO vê serviço inativo', tt.try('anon',null,$q$select 1 from services where slug='fox-easy'$q$), 'ok:0');
select tt.expect('admin vê serviço inativo', tt.try('authenticated',:A,$q$select 1 from services where slug='fox-easy'$q$), 'ok:1');
update services set active=true where slug='fox-easy';
-- ---------- integridade
select tt.expect('maintenance_days exige valor de manutenção', tt.try('postgres',null,$q$update services set maintenance_days=30 where slug='remocao-de-extensao'$q$), 'ERRO:23514');
-- ---------- storage
select tt.expect('cliente NÃO envia ao bucket', tt.try('authenticated',:C,$q$insert into storage.objects(bucket_id,name) values('site-media','servicos/a.webp')$q$), 'ERRO:42501');
select tt.expect('anon NÃO envia ao bucket', tt.try('anon',null,$q$insert into storage.objects(bucket_id,name) values('site-media','servicos/a.webp')$q$), 'ERRO:42501');
select tt.expect('admin envia em servicos/', tt.try('authenticated',:A,$q$insert into storage.objects(bucket_id,name) values('site-media','servicos/volume-egipcio.webp')$q$), 'ok:1');
select tt.expect('admin NÃO envia em pasta não prevista', tt.try('authenticated',:A,$q$insert into storage.objects(bucket_id,name) values('site-media','outra/a.webp')$q$), 'ERRO:42501');
select tt.expect('admin NÃO escreve em outro bucket', tt.try('authenticated',:A,$q$insert into storage.objects(bucket_id,name) values('privado','servicos/a.webp')$q$), 'ERRO:%');
select tt.expect('cliente NÃO apaga (RLS: 0 linhas)', tt.try('authenticated',:C,$q$delete from storage.objects where bucket_id='site-media'$q$), 'ok:0');
select tt.expect('cliente NÃO lista bucket', tt.try('authenticated',:C,$q$select 1 from storage.objects where bucket_id='site-media'$q$), 'ok:0');
select tt.expect('anon NÃO lista bucket', tt.try('anon',null,$q$select 1 from storage.objects where bucket_id='site-media'$q$), '%');
select tt.expect('admin lista/substitui', tt.try('authenticated',:A,$q$update storage.objects set name='servicos/volume-egipcio.png' where bucket_id='site-media'$q$), 'ok:1');
select tt.expect('admin NÃO move para pasta inválida', tt.try('authenticated',:A,$q$update storage.objects set name='x/y.png' where bucket_id='site-media'$q$), 'ERRO:%');
select tt.expect('admin exclui', tt.try('authenticated',:A,$q$delete from storage.objects where bucket_id='site-media'$q$), 'ok:1');
-- ---------- seed preserva image_path
update services set image_path='servicos/mega-volume.webp' where slug='mega-volume';
\i supabase/seed.sql
select tt.expect('re-seed preserva image_path', (select coalesce(image_path,'NULL') from services where slug='mega-volume'), 'servicos/mega-volume.webp');
update services set image_path=null where slug='mega-volume';
-- ---------- bucket
select tt.expect('bucket público, 5MB, só imagens', (select public::text||'/'||file_size_limit||'/'||array_to_string(allowed_mime_types,',') from storage.buckets where id='site-media'), 'true/5242880/image/jpeg,image/png,image/webp,image/avif');
