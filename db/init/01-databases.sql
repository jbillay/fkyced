# create databases
CREATE DATABASE IF NOT EXISTS `camunda_db`;
CREATE DATABASE IF NOT EXISTS `fkyced_db`;

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
  id INT NOT NULL AUTO_INCREMENT,
  objectId INT NOT NULL,
  fieldType ENUM('checkbox', 'currency', 'date', 'number', 'object', 'phone', 'picklist', 'picklistMulti', 'text', 'textArea') NOT NULL,
  camundaType ENUM('boolean', 'integer', 'double', 'date', 'string', 'json'),
  label VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  helper TEXT,
  required BOOLEAN default 0,
  defaultValue VARCHAR(255),
  numLength INT,
  numDecimal INT,
  valueUnique BOOLEAN default 0,
  listId INT,
  listValues TEXT,
  displayLine INT,
  valueSize INT,
  linkedObjectId INT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
)
