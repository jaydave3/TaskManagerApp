-- =============================================================================
-- Migration: 001_Add_Extended_Task_Fields.sql
-- Description: Incrementally adds description, priority, due date, category, 
--              and timestamps to the existing 'tasks' table in MySQL.
-- Compatibility: Completely safe and non-destructive. Preserves all existing rows.
-- =============================================================================

USE `taskmanagerdb`;

-- Add columns only if they do not exist (MySQL 8.0+ compatible / safe script)
ALTER TABLE `tasks`
  ADD COLUMN IF NOT EXISTS `Description` TEXT NULL AFTER `Title`,
  ADD COLUMN IF NOT EXISTS `Priority` VARCHAR(20) NOT NULL DEFAULT 'Medium' AFTER `Description`,
  ADD COLUMN IF NOT EXISTS `DueDate` DATETIME NULL AFTER `Priority`,
  ADD COLUMN IF NOT EXISTS `Category` VARCHAR(50) NULL AFTER `DueDate`,
  ADD COLUMN IF NOT EXISTS `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `IsCompleted`,
  ADD COLUMN IF NOT EXISTS `UpdatedAt` DATETIME NULL AFTER `CreatedAt`;

-- If MySQL version does not support IF NOT EXISTS in ALTER TABLE, use individual statements:
-- ALTER TABLE `tasks` ADD COLUMN `Description` TEXT NULL;
-- ALTER TABLE `tasks` ADD COLUMN `Priority` VARCHAR(20) NOT NULL DEFAULT 'Medium';
-- ALTER TABLE `tasks` ADD COLUMN `DueDate` DATETIME NULL;
-- ALTER TABLE `tasks` ADD COLUMN `Category` VARCHAR(50) NULL;
-- ALTER TABLE `tasks` ADD COLUMN `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE `tasks` ADD COLUMN `UpdatedAt` DATETIME NULL;
