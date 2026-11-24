-- RLS/grants do admin criando e editando catálogos e procedimentos (migration 20261124000002).
-- Roda depois de catalog_rls.sql (reaproveita tt.try/tt.expect e os usuários admin/cliente).
-- Obs.: catalog_rls.sql deixa o serviço 'volume-egipcio' com image_path alterado; aqui não dependemos disso.
\set ON_ERROR_STOP off
\set A '''00000000-0000-0000-0000-0000000000aa'''
\set C '''00000000-0000-0000-0000-0000000000bb'''

-- criar catálogo
select tt.expect('catálogo: anon NÃO cria', tt.try('anon',null,$q$insert into service_categories(slug,position,index_label,title,tagline,declared_option_count) values('unhas',5,'05','Unhas','Cuidado',0)$q$), 'ERRO:42501');
select tt.expect('catálogo: cliente NÃO cria', tt.try('authenticated',:C,$q$insert into service_categories(slug,position,index_label,title,tagline,declared_option_count) values('unhas',5,'05','Unhas','Cuidado',0)$q$), 'ERRO:42501');
select tt.expect('catálogo: ADMIN cria', tt.try('authenticated',:A,$q$insert into service_categories(slug,position,index_label,title,tagline,declared_option_count) values('unhas',5,'05','Unhas','Cuidado e design',0)$q$), 'ok:1');
select tt.expect('catálogo: slug duplicado = 23505', tt.try('authenticated',:A,$q$insert into service_categories(slug,position,index_label,title,tagline,declared_option_count) values('unhas',6,'06','Outra','x',0)$q$), 'ERRO:23505');
select tt.expect('catálogo: título curto demais = 23514', tt.try('authenticated',:A,$q$insert into service_categories(slug,position,index_label,title,tagline,declared_option_count) values('curto',7,'07','A','x',0)$q$), 'ERRO:23514');
select tt.expect('catálogo: ADMIN edita título', tt.try('authenticated',:A,$q$update service_categories set title='Unhas & Nail Art' where slug='unhas'$q$), 'ok:1');
select tt.expect('catálogo: cliente NÃO edita (RLS)', tt.try('authenticated',:C,$q$update service_categories set title='x' where slug='unhas'$q$), 'ok:0');
select tt.expect('catálogo: slug NÃO é editável (grant por coluna)', tt.try('authenticated',:A,$q$update service_categories set slug='outro' where slug='unhas'$q$), 'ERRO:42501');
select tt.expect('catálogo: ADMIN NÃO apaga (sem DELETE)', tt.try('authenticated',:A,$q$delete from service_categories where slug='unhas'$q$), 'ERRO:42501');

-- criar procedimento
select tt.expect('proc: anon NÃO cria', tt.try('anon',null,$q$insert into services(slug,category_slug,position,name,description,price_cents) values('esmaltacao','unhas',1,'Esmaltação','x',5000)$q$), 'ERRO:42501');
select tt.expect('proc: cliente NÃO cria', tt.try('authenticated',:C,$q$insert into services(slug,category_slug,position,name,description,price_cents) values('esmaltacao','unhas',1,'Esmaltação','x',5000)$q$), 'ERRO:42501');
select tt.expect('proc: ADMIN cria', tt.try('authenticated',:A,$q$insert into services(slug,category_slug,position,name,description,price_cents,maintenance_cents,maintenance_days,notes,active) values('esmaltacao','unhas',1,'Esmaltação em gel','Esmalte em gel',8000,4000,15,array['Evitar água 24h'],true)$q$), 'ok:1');
select tt.expect('proc: catálogo inexistente = 23503', tt.try('authenticated',:A,$q$insert into services(slug,category_slug,position,name,description,price_cents) values('x1','nao-existe',1,'Nome','x',100)$q$), 'ERRO:23503');
select tt.expect('proc: prazo sem valor de manutenção = 23514', tt.try('authenticated',:A,$q$insert into services(slug,category_slug,position,name,description,price_cents,maintenance_days) values('x2','unhas',2,'Nome','x',100,10)$q$), 'ERRO:23514');
select tt.expect('proc: preço negativo = 23514', tt.try('authenticated',:A,$q$insert into services(slug,category_slug,position,name,description,price_cents) values('x3','unhas',2,'Nome','x',-1)$q$), 'ERRO:23514');
select tt.expect('proc: nome curto = 23514', tt.try('authenticated',:A,$q$insert into services(slug,category_slug,position,name,description,price_cents) values('x4','unhas',2,'N','x',100)$q$), 'ERRO:23514');
select tt.expect('proc: ADMIN edita preço', tt.try('authenticated',:A,$q$update services set price_cents=9000 where slug='esmaltacao'$q$), 'ok:1');
select tt.expect('proc: cliente NÃO edita preço (RLS)', tt.try('authenticated',:C,$q$update services set price_cents=1 where slug='esmaltacao'$q$), 'ok:0');
select tt.expect('proc: ADMIN move de catálogo', tt.try('authenticated',:A,$q$update services set category_slug='cilios' where slug='esmaltacao'$q$), 'ok:1');
select tt.expect('proc: coluna gerada não é gravável', tt.try('authenticated',:A,$q$update services set application_price=1 where slug='esmaltacao'$q$), 'ERRO:%');
select tt.expect('proc: ADMIN NÃO apaga', tt.try('authenticated',:A,$q$delete from services where slug='esmaltacao'$q$), 'ERRO:42501');

-- arquivar: some para anon, continua para admin
select tt.expect('proc: ADMIN arquiva', tt.try('authenticated',:A,$q$update services set active=false where slug='esmaltacao'$q$), 'ok:1');
select tt.expect('proc: anon NÃO vê arquivado', tt.try('anon',null,$q$select 1 from services where slug='esmaltacao'$q$), 'ok:0');
select tt.expect('proc: admin vê arquivado', tt.try('authenticated',:A,$q$select 1 from services where slug='esmaltacao'$q$), 'ok:1');
select tt.expect('catálogo: ADMIN arquiva', tt.try('authenticated',:A,$q$update service_categories set active=false where slug='unhas'$q$), 'ok:1');
select tt.expect('catálogo: anon NÃO vê arquivado', tt.try('anon',null,$q$select 1 from service_categories where slug='unhas'$q$), 'ok:0');
select tt.expect('catálogo: admin vê arquivado', tt.try('authenticated',:A,$q$select 1 from service_categories where slug='unhas'$q$), 'ok:1');
