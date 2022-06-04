DROP PROCEDURE IF EXISTS current_age;


IF EXISTS (SELECT 0 FROM  sys.fulltext_indexes 
                    WHERE object_id = object_id('dbo.challenges'))
   DROP FULLTEXT INDEX ON challenges;

IF EXISTS (SELECT 0 FROM  sys.fulltext_indexes 
                    WHERE object_id = object_id('dbo.races'))
   DROP FULLTEXT INDEX ON races;

IF EXISTS (SELECT 0 FROM  sys.fulltext_indexes 
                    WHERE object_id = object_id('dbo.groups'))
   DROP FULLTEXT INDEX ON groups;

IF EXISTS (SELECT 0 FROM  sys.fulltext_indexes 
                    WHERE object_id = object_id('dbo.users'))
   DROP FULLTEXT INDEX ON users;

IF EXISTS (SELECT 0 FROM  sys.fulltext_catalogs 
                    WHERE name = N'search')
   DROP FULLTEXT CATALOG search;


DROP INDEX IF EXISTS idx_challenges_id            ON challenges;
DROP INDEX IF EXISTS idx_races_id                 ON races;
DROP INDEX IF EXISTS idx_groups_id                ON groups;
DROP INDEX IF EXISTS idx_users_id                 ON users;
DROP INDEX IF EXISTS idx_friends_follower         ON friends;
DROP INDEX IF EXISTS idx_friends_followee         ON friends;
DROP INDEX IF EXISTS idx_activities_athlete       ON activities;
DROP INDEX IF EXISTS idx_race_categories          ON race_categories;
DROP INDEX IF EXISTS idx_race_private_groups      ON race_private_groups;
DROP INDEX IF EXISTS idx_race_participants        ON race_participants;
DROP INDEX IF EXISTS idx_race_sponsors            ON race_sponsors;
DROP INDEX IF EXISTS idx_bank_accounts_race       ON bank_accounts;
DROP INDEX IF EXISTS idx_challenge_private_groups ON challenge_private_groups;
DROP INDEX IF EXISTS idx_challenge_participants   ON challenge_participants;
DROP INDEX IF EXISTS idx_challenge_activities     ON challenge_activities;


DROP TABLE IF EXISTS challenge_activities;
DROP TABLE IF EXISTS challenge_participants;
DROP TABLE IF EXISTS challenge_private_groups;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS bank_accounts;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS race_sponsors;
DROP TABLE IF EXISTS race_participants;
DROP TABLE IF EXISTS race_private_groups;
DROP TABLE IF EXISTS race_tracks;
DROP TABLE IF EXISTS race_categories;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS sponsor_logos;
DROP TABLE IF EXISTS sponsors;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS activity_tracks;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS activity_types;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS countries;


IF EXISTS (SELECT 0 FROM  sys.xml_schema_collections 
                    WHERE name = N'gpx' AND schema_id = SCHEMA_ID(N'dbo'))
   DROP XML SCHEMA COLLECTION gpx;
