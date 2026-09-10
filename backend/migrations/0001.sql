CREATE TABLE totals (scope TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0);
INSERT INTO totals VALUES ('public',0),('preview',0);
CREATE TABLE visits (token TEXT PRIMARY KEY, scope TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX visits_age ON visits(created_at);
CREATE INDEX visits_ip ON visits(ip_hash,created_at);
CREATE TRIGGER visit_guard BEFORE INSERT ON visits WHEN NOT EXISTS(SELECT 1 FROM visits WHERE token=NEW.token) BEGIN
 SELECT (CASE WHEN (SELECT COUNT(*) FROM visits WHERE ip_hash=NEW.ip_hash AND created_at>NEW.created_at-3600)>=300 THEN RAISE(ABORT,'visit_limit') END);
END;
CREATE TRIGGER visit_total AFTER INSERT ON visits BEGIN
 UPDATE totals SET count=count+1 WHERE scope=NEW.scope;
END;
CREATE TABLE wall_posts (id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, title TEXT NOT NULL CHECK(length(title)<=80), name TEXT NOT NULL CHECK(length(name)<=40), image BLOB NOT NULL CHECK(length(image)<=256000), ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX wall_date ON wall_posts(created_at DESC);
CREATE INDEX wall_ip ON wall_posts(ip_hash,created_at);
CREATE TABLE wall_storage(id INTEGER PRIMARY KEY,bytes INTEGER NOT NULL);
INSERT INTO wall_storage VALUES(1,0);
CREATE TRIGGER wall_grow AFTER INSERT ON wall_posts BEGIN UPDATE wall_storage SET bytes=bytes+length(NEW.image) WHERE id=1; END;
CREATE TRIGGER wall_shrink AFTER DELETE ON wall_posts BEGIN UPDATE wall_storage SET bytes=bytes-length(OLD.image) WHERE id=1; END;
CREATE TRIGGER wall_guard BEFORE INSERT ON wall_posts WHEN NOT EXISTS(SELECT 1 FROM wall_posts WHERE request_id=NEW.request_id) BEGIN
 SELECT (CASE WHEN (SELECT COUNT(*) FROM wall_posts WHERE ip_hash=NEW.ip_hash AND created_at>NEW.created_at-86400)>=50 THEN RAISE(ABORT,'post_limit') END);
 SELECT (CASE WHEN (SELECT COUNT(*) FROM wall_posts WHERE created_at>NEW.created_at-86400)>=500 THEN RAISE(ABORT,'wall_busy') END);
 SELECT (CASE WHEN (SELECT bytes FROM wall_storage WHERE id=1)+length(NEW.image)>250000000 THEN RAISE(ABORT,'wall_full') END);
END;
