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
