# performances schema

# --- !Ups

CREATE TABLE performance (
    task_id bigint NOT NULL,
    date datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
    FOREIGN KEY (task_id) REFERENCES task(id)
);

# --- !Downs

DROP TABLE performance;
