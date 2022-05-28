DROP PROCEDURE IF EXISTS current_age;


IF EXISTS (SELECT 0 FROM  sys.fulltext_indexes 
                    WHERE object_id = object_id('dbo.users'))
   DROP FULLTEXT INDEX ON users;

IF EXISTS (SELECT 0 FROM  sys.fulltext_catalogs 
                    WHERE name = N'search')
   DROP FULLTEXT CATALOG search;

DROP INDEX IF EXISTS idx_users_Id ON users;


DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS activity_types;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS countries;


IF EXISTS (SELECT 0 FROM  sys.xml_schema_collections 
                    WHERE name = N'gpx' AND schema_id = SCHEMA_ID(N'dbo'))
   DROP XML SCHEMA COLLECTION gpx;
