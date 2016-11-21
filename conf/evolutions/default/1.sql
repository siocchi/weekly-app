# Tasks schema

# --- !Ups

CREATE SEQUENCE task_id_seq;
CREATE TABLE task (
	id bigint NOT NULL DEFAULT nextval('task_id_seq'),
	body varchar(255) NOT NULL,
	num_quota int NOT NULL DEFAULT 1,
	hidden boolean NOT NULL DEFAULT false,
	PRIMARY KEY (id)
);

# --- !Downs

DROP TABLE task;
DROP SEQUENCE task_id_seq;

