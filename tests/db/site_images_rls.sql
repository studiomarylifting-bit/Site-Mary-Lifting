-- Testes de RLS/Storage das imagens editáveis do site. Roda depois de catalog_rls.sql
-- (reaproveita tt.try/tt.expect e os usuários admin/cliente criados lá).
\set ON_ERROR_STOP off
\set A '''00000000-0000-0000-0000-0000000000aa'''
\set C '''00000000-0000-0000-0000-0000000000bb'''

select tt.expect('imagens: anon lê (público)', tt.try('anon',null,'select 1 from site_images'), 'ok:%');
select tt.expect('imagens: anon NÃO grava', tt.try('anon',null,$q$insert into site_images(slot,image_path) values ('logoLight','brand/a.png')$q$), 'ERRO:42501');
select tt.expect('imagens: cliente NÃO grava', tt.try('authenticated',:C,$q$insert into site_images(slot,image_path) values ('logoLight','brand/a.png')$q$), 'ERRO:42501');
select tt.expect('imagens: ADMIN grava', tt.try('authenticated',:A,$q$insert into site_images(slot,image_path,updated_by) values ('logoLight','brand/logoLight-abc.png','00000000-0000-0000-0000-0000000000aa')$q$), 'ok:1');
select tt.expect('imagens: ADMIN troca (update)', tt.try('authenticated',:A,$q$update site_images set image_path='brand/logoLight-def.webp' where slot='logoLight'$q$), 'ok:1');
select tt.expect('imagens: cliente NÃO altera (RLS)', tt.try('authenticated',:C,$q$update site_images set image_path='brand/x.png'$q$), 'ok:0');
select tt.expect('imagens: cliente NÃO apaga (RLS)', tt.try('authenticated',:C,$q$delete from site_images$q$), 'ok:0');
select tt.expect('imagens: rejeita URL', tt.try('authenticated',:A,$q$insert into site_images(slot,image_path) values ('heroPhoto','https://evil.com/a.jpg')$q$), 'ERRO:23514');
select tt.expect('imagens: rejeita path traversal', tt.try('authenticated',:A,$q$insert into site_images(slot,image_path) values ('heroPhoto','home/../x.png')$q$), 'ERRO:23514');
select tt.expect('imagens: rejeita pasta fora da lista', tt.try('authenticated',:A,$q$insert into site_images(slot,image_path) values ('heroPhoto','segredos/x.png')$q$), 'ERRO:23514');
select tt.expect('imagens: rejeita SVG', tt.try('authenticated',:A,$q$insert into site_images(slot,image_path) values ('heroPhoto','home/x.svg')$q$), 'ERRO:23514');
select tt.expect('imagens: rejeita slot inválido', tt.try('authenticated',:A,$q$insert into site_images(slot,image_path) values ('a b; drop','home/x.png')$q$), 'ERRO:23514');
select tt.expect('imagens: ADMIN restaura padrão (delete)', tt.try('authenticated',:A,$q$delete from site_images where slot='logoLight'$q$), 'ok:1');

-- Storage: pasta brand/ liberada só ao admin
insert into storage.buckets (id,name,public) values ('site-media','site-media',true) on conflict do nothing;
select tt.expect('storage: admin envia em brand/', tt.try('authenticated',:A,$q$insert into storage.objects(bucket_id,name) values ('site-media','brand/logo-1.png')$q$), 'ok:1');
select tt.expect('storage: admin envia em home/', tt.try('authenticated',:A,$q$insert into storage.objects(bucket_id,name) values ('site-media','home/hero-1.png')$q$), 'ok:1');
select tt.expect('storage: cliente NÃO envia em brand/', tt.try('authenticated',:C,$q$insert into storage.objects(bucket_id,name) values ('site-media','brand/x.png')$q$), 'ERRO:42501');
select tt.expect('storage: anon NÃO envia', tt.try('anon',null,$q$insert into storage.objects(bucket_id,name) values ('site-media','brand/x.png')$q$), 'ERRO:42501');
select tt.expect('storage: admin NÃO envia em pasta fora da lista', tt.try('authenticated',:A,$q$insert into storage.objects(bucket_id,name) values ('site-media','segredos/x.png')$q$), 'ERRO:42501');
