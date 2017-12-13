CREATE DATABASE IF NOT EXISTS `ota2-test_db`;
use `ota2-test_db`;


SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Table `ota2-test_db`.`groups`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ota2-test_db`.`groups` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `group_level` INT(11) NOT NULL,
  `group_name` VARCHAR(50) NOT NULL,
  `modified_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT(11) NOT NULL,
  `created_date` TIMESTAMP NOT NULL,
  `created_by` INT(11) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `ota2-test_db`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ota2-test_db`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `pvid` VARCHAR(255) NOT NULL,
  `otp` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `nick_name` VARCHAR(255) NOT NULL,
  `group_id` INT(11) NOT NULL,
  `group_level` INT(11) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `lang_code` VARCHAR(15) NULL DEFAULT NULL,
  `modified_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_date` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `user_group_id_idx` (`group_id` ASC),
  CONSTRAINT `user_group_id`
    FOREIGN KEY (`group_id`)
    REFERENCES `ota2-test_db`.`groups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `ota2-test_db`.`projects`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ota2-test_db`.`projects` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `project_name` VARCHAR(255) NOT NULL,
  `project_code` VARCHAR(255) NULL DEFAULT NULL,
  `file_count` INT(11) NULL DEFAULT '0',
  `is_public` TINYINT(1) NULL DEFAULT '0',
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `modified_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT(11) NOT NULL,
  `created_date` TIMESTAMP NOT NULL,
  `created_by` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `project_created_by`
    FOREIGN KEY (`created_by`)
    REFERENCES `ota2-test_db`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `project_modified_by`
    FOREIGN KEY (`modified_by`)
    REFERENCES `ota2-test_db`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `ota2-test_db`.`files`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ota2-test_db`.`files` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `project_name` VARCHAR(255) NOT NULL,
  `platform` VARCHAR(50) NOT NULL,
  `service_type` VARCHAR(50) NOT NULL,
  `version` VARCHAR(50) NOT NULL,
  `build_datetime` TIMESTAMP NOT NULL,
  `comment` VARCHAR(500) NULL DEFAULT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `permalink` VARCHAR(500) NOT NULL,
  `alias` VARCHAR(500),
  `project_id` INT(11) NOT NULL,
  `is_public` TINYINT(1) NULL DEFAULT '0',
  `ip_address` VARCHAR(20) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `modified_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT(11) NOT NULL,
  `created_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` INT(11) NOT NULL,
  `uploaded_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `files_modified_by_idx` (`modified_by` ASC),
  INDEX `file_uploaded_by_idx` (`uploaded_by` ASC),
  INDEX `file_project_id_idx` (`project_id` ASC),
  CONSTRAINT `file_created_by`
    FOREIGN KEY (`created_by`)
    REFERENCES `ota2-test_db`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `file_modified_by`
    FOREIGN KEY (`modified_by`)
    REFERENCES `ota2-test_db`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `file_project_id`
    FOREIGN KEY (`project_id`)
    REFERENCES `ota2-test_db`.`projects` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `file_uploaded_by`
    FOREIGN KEY (`uploaded_by`)
    REFERENCES `ota2-test_db`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `ota2-test_db`.`download_audit`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ota2-test_db`.`download_audit` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `file_id` INT(11) NOT NULL,
  `pvid` VARCHAR(50) NULL DEFAULT NULL,
  `ip_address` VARCHAR(50) NOT NULL,
  `audit_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `audit_file_id`
    FOREIGN KEY (`file_id`)
    REFERENCES `ota2-test_db`.`files` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

INSERT INTO groups VALUES (1, 4, 'VSAdmin', now(), 1, now(), 1);
INSERT INTO groups VALUES (2, 3, 'VSMember', now(), 1, now(), 1);
INSERT INTO groups VALUES (3, 2, 'Partner', now(), 1, now(), 1);
INSERT INTO groups VALUES (4, 1, 'Customer', now(), 1, now(), 1);

INSERT INTO users VALUES (1, 1, 1, 'hlee@slkonnect.com','hlee',1,1,1,1,curdate(),curdate());
INSERT INTO users VALUES (2, '', '', '','anonymous',4,1,1,"en",curdate(),curdate());
INSERT INTO projects VALUES (1,'Project 1', 001, 0, 1, 1, curdate(), 1, curdate(), 1);
INSERT INTO projects VALUES (2,'Project 2', 002, 0, 0, 1, curdate(), 1, curdate(), 1);


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
