
/* Table definition for the todos table in the database */

CREATE TABLE `todos` (
  `id`       int(11)      NOT NULL AUTO_INCREMENT COMMENT 'Primary key for the table.',
  `title`    varchar(256) NOT NULL DEFAULT ''     COMMENT 'The text for the todo item.',
  `complete` bit(1)       NOT NULL DEFAULT b'0'   COMMENT 'Boolean indicating whether or not the item is complete.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='To Do items.'