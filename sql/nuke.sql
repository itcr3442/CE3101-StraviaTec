DROP PROCEDURE IF EXISTS current_age;


DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS activity_types;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS countries;


IF EXISTS (SELECT * FROM sys.xml_schema_collections 
                    WHERE name = N'gpx'
                    AND schema_id = SCHEMA_ID(N'dbo'))
   DROP XML SCHEMA COLLECTION gpx;
