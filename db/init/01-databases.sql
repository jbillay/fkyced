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

CREATE TABLE IF NOT EXISTS processes (
  id INT NOT NULL AUTO_INCREMENT,
  processName VARCHAR(100) NOT NULL,
  processKey VARCHAR(100) NOT NULL,
  processVersion VARCHAR(10) NOT NULL default 'latest',
  active BOOLEAN NOT NULL default 1,
  activeSince TIMESTAMP default now(),
  inactiveSince TIMESTAMP NULL DEFAULT NULL,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS fkycedForms (
  id INT NOT NULL AUTO_INCREMENT,
  formName VARCHAR(100) NOT NULL,
  formId VARCHAR(100) NOT NULL UNIQUE,
  formStructure TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS fkycedLists (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  parentId INT,
  valueList TEXT,
  sorted BOOLEAN NOT NULL default 0,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS fkycedObjects (
  id INT NOT NULL AUTO_INCREMENT,
  label VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
)

CREATE TABLE IF NOT EXISTS fkycedFields (
  id int(11) NOT NULL AUTO_INCREMENT,
  fieldType enum('checkbox','currency','date','number','object','phone','picklist','picklistMulti','text','textArea') NOT NULL,
  camundaType enum('boolean','integer','double','date','string','json') NOT NULL,
  label varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  description text,
  helper text,
  required tinyint(1) DEFAULT '0',
  defaultValue varchar(255) DEFAULT NULL,
  numLength int(11) DEFAULT NULL,
  numDecimal int(11) DEFAULT NULL,
  valueUnique tinyint(1) DEFAULT '1',
  listId int(11) DEFAULT NULL,
  listValues text,
  displayLine int(11) DEFAULT NULL,
  linkedObjectId int(11) DEFAULT NULL,
  valueSize int(11) DEFAULT NULL,
  createdAt datetime NOT NULL,
  updatedAt datetime NOT NULL,
  objectId int(11) DEFAULT NULL,
  fkycedObjectId int(11) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY objectId (objectId),
  KEY fkycedObjectId (fkycedObjectId),
  CONSTRAINT fkycedFields_ibfk_1 FOREIGN KEY (objectId) REFERENCES fkycedObjects (id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fkycedFields_ibfk_2 FOREIGN KEY (fkycedObjectId) REFERENCES fkycedObjects (id) ON DELETE SET NULL ON UPDATE CASCADE
)
