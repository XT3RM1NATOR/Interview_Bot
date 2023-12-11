-- CREATE DATABASE IF NOT EXISTS node_ru;
-- USE node_ru;

-- DROP TABLE IF EXISTS interviewer_slot;
-- DROP TABLE IF EXISTS user;
-- DROP TABLE IF EXISTS chat_list ;
-- DROP TABLE IF EXISTS session;
-- DROP TABLE IF EXISTS tg_chat;


-- -- Table for the user data
-- CREATE TABLE user (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   username VARCHAR(255) UNIQUE NOT NULL,
--   role ENUM('admin', 'interviewer', 'interviewee') NOT NULL,
--   timezone_hour INT,
--   timezone_minute INT,
--   approved BOOLEAN,
--   description VARCHAR(150),
--   chat_id BIGINT NOT NULL,
--   tg_chat_id INT NOT NULl
-- );

-- -- Table for the session data
-- CREATE TABLE session (
-- 	id INT AUTO_INCREMENT PRIMARY KEY,
-- 	role VARCHAR(20),
--  timezone_hour INT,
--  timezone_minute INT,
--  description VARCHAR(500),
--  interviewer BOOLEAN,
--  stageId INT,
--  chat_id BIGINT NOT NULL,
--  tg_chat_id INT
-- );

-- -- Table for the list of available chats
-- CREATE TABLE chat_list (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   chat_name VARCHAR(255) UNIQUE NOT NULL
-- );

-- -- Table for interviewer slots
-- CREATE TABLE interviewer_slot (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   interviewer_id INT NOT NULL,
--   interviewer_username VARCHAR(50) NOT NULL,
--   start_time DATETIME NOT NULL,
--   end_time DATETIME NOT NULL,
--   interviewee_id INT,
--   chat_id INT
-- );

-- CREATE TABLE tg_chat (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   link VARCHAR(30) NOT NULL,
--   name VARCHAR(20) NOT NULL
-- );

