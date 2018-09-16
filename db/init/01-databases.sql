# create databases
CREATE DATABASE IF NOT EXISTS camunda_db;
CREATE DATABASE IF NOT EXISTS fkyced_db;

# create users and grant rights
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'noofs';
CREATE USER IF NOT EXISTS 'fkyced'@'localhost' IDENTIFIED BY 'fkyced';
GRANT ALL ON *.* TO 'root'@'%';
GRANT ALL ON camunda_db.* TO 'fkyced'@'%';
GRANT ALL ON fkyced_db.* TO 'fkyced'@'%';

# init fkyced structure

USE fkyced_db

CREATE TABLE IF NOT EXISTS `fkycedObjects`
  ( `id` INTEGER auto_increment ,
    `label` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
  )
  ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fkycedFields`
  ( `id` INTEGER auto_increment ,
    `fieldType` ENUM('checkbox', 'currency', 'date', 'number', 'object', 'phone', 'picklist', 'picklistMulti', 'text', 'textArea') NOT NULL,
    `camundaType` ENUM('boolean', 'integer', 'double', 'date', 'string', 'json') NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `helper` TEXT,
    `required` TINYINT(1) DEFAULT false,
    `defaultValue` VARCHAR(255),
    `numLength` INTEGER,
    `numDecimal` INTEGER,
    `valueUnique` TINYINT(1) DEFAULT true,
    `listId` INTEGER,
    `listValues` TEXT,
    `displayLine` INTEGER,
    `linkedObjectId` INTEGER,
    `valueSize` INTEGER,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    `objectId` INTEGER,
    `fkycedObjectId` INTEGER,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`objectId`) REFERENCES `fkycedObjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, FOREIGN KEY (`fkycedObjectId`) REFERENCES `fkycedObjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
  )
  ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fkycedForms`
  ( `id` INTEGER auto_increment ,
    `formName` VARCHAR(255) NOT NULL,
    `formId` VARCHAR(255) NOT NULL,
    `formStructure` TEXT,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
  )
  ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fkycedLists`
  ( `id` INTEGER auto_increment ,
    `name` VARCHAR(255) NOT NULL,
    `parentId` INTEGER,
    `valueList` TEXT NOT NULL,
    `sorted` TINYINT(1) DEFAULT false,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
  )
  ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fkycedProcesses`
  ( `id` INTEGER auto_increment ,
    `processName` VARCHAR(255) NOT NULL,
    `processKey` VARCHAR(255) NOT NULL,
    `processVersion` VARCHAR(255) NOT NULL DEFAULT 'latest',
    `active` TINYINT(1) DEFAULT true,
    `activeSince` DATETIME,
    `inactiveSince` DATETIME,
    `createdAt` DATETIME NOT NULL,
    `updatedAt` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
  )
  ENGINE=InnoDB;
