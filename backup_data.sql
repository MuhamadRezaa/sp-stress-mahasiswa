-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: stress_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `digital_activities`
--

DROP TABLE IF EXISTS `digital_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `digital_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity_date` date NOT NULL,
  `smartphone_duration_hours` varchar(50) NOT NULL,
  `social_media_access_count` varchar(50) NOT NULL,
  `social_media_duration_hours` varchar(50) NOT NULL,
  `course_count` varchar(50) NOT NULL,
  `task_count` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `day_type` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_activity_date` (`user_id`,`activity_date`),
  CONSTRAINT `digital_activities_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `digital_activities`
--

LOCK TABLES `digital_activities` WRITE;
/*!40000 ALTER TABLE `digital_activities` DISABLE KEYS */;
INSERT INTO `digital_activities` VALUES (1,1,'2026-04-10','1','1','1','1','1','2026-04-11 08:08:46','2026-04-11 08:08:46',''),(2,1,'2026-04-13','5','8','4','3','2','2026-04-13 15:11:20','2026-04-13 15:11:20',''),(3,1,'2026-04-14','4','5','4','2','2','2026-04-14 04:02:51','2026-04-14 04:02:51',''),(4,1,'2026-04-15','3','6','2','4','2','2026-04-19 14:10:44','2026-04-19 14:10:44',''),(5,1,'2026-04-20','3','3','2','1','1','2026-04-20 15:15:21','2026-04-20 15:15:21',''),(6,1,'2026-04-19','1','1','1','1','1','2026-04-21 00:23:18','2026-04-21 00:23:18','ujian'),(7,1,'2026-04-12','<2 jam','Jarang (1–3 kali)','<1 jam','2','3–4','2026-04-21 00:39:00','2026-04-21 00:39:00','perkuliahan');
/*!40000 ALTER TABLE `digital_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `physiological_data`
--

DROP TABLE IF EXISTS `physiological_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `physiological_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity_date` date NOT NULL,
  `heart_rate_avg` int NOT NULL,
  `heart_rate_min` int NOT NULL,
  `heart_rate_max` int NOT NULL,
  `step_count` int NOT NULL,
  `sleep_duration_hours` float NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_physio_date` (`user_id`,`activity_date`),
  CONSTRAINT `physiological_data_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `physiological_data`
--

LOCK TABLES `physiological_data` WRITE;
/*!40000 ALTER TABLE `physiological_data` DISABLE KEYS */;
INSERT INTO `physiological_data` VALUES (1,1,'2026-04-10',80,50,110,6000,6,'2026-04-11 08:08:46','2026-04-11 08:08:46'),(2,1,'2026-04-13',80,60,110,6000,7,'2026-04-13 15:11:48','2026-04-13 15:11:48'),(3,1,'2026-04-14',70,60,110,6000,7,'2026-04-14 04:02:51','2026-04-14 04:02:51'),(4,1,'2026-04-15',75,61,112,6534,8,'2026-04-19 14:10:44','2026-04-19 14:10:44'),(5,1,'2026-04-20',70,60,100,6500,7,'2026-04-20 15:15:21','2026-04-20 15:15:21'),(6,1,'2026-04-19',70,60,110,6500,7,'2026-04-21 00:23:18','2026-04-21 00:23:18'),(7,1,'2026-04-12',70,60,110,5500,7,'2026-04-21 00:39:00','2026-04-21 00:39:00');
/*!40000 ALTER TABLE `physiological_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pss10_responses`
--

DROP TABLE IF EXISTS `pss10_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pss10_responses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `activity_date` date NOT NULL,
  `q1` int NOT NULL,
  `q2` int NOT NULL,
  `q3` int NOT NULL,
  `q4` int NOT NULL,
  `q5` int NOT NULL,
  `q6` int NOT NULL,
  `q7` int NOT NULL,
  `q8` int NOT NULL,
  `q9` int NOT NULL,
  `q10` int NOT NULL,
  `total_score` int NOT NULL,
  `stress_level` varchar(10) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_pss10_date` (`user_id`,`activity_date`),
  CONSTRAINT `pss10_responses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pss10_responses`
--

LOCK TABLES `pss10_responses` WRITE;
/*!40000 ALTER TABLE `pss10_responses` DISABLE KEYS */;
INSERT INTO `pss10_responses` VALUES (1,1,'2026-04-10',3,2,3,4,3,2,3,1,2,2,25,'medium','2026-04-11 08:08:46','2026-04-11 08:08:46'),(2,1,'2026-04-13',4,3,2,2,3,2,3,2,1,2,24,'medium','2026-04-13 15:11:48','2026-04-13 15:11:48'),(3,1,'2026-04-14',4,3,2,3,2,3,3,2,1,1,26,'medium','2026-04-14 04:02:51','2026-04-14 04:02:51'),(4,1,'2026-04-15',4,3,4,3,4,3,2,1,0,0,34,'high','2026-04-19 14:10:44','2026-04-19 14:10:44'),(5,1,'2026-04-20',4,3,3,2,2,3,2,1,1,1,28,'high','2026-04-20 15:15:21','2026-04-20 15:15:21'),(6,1,'2026-04-19',3,3,1,2,1,0,3,4,4,3,12,'low','2026-04-21 00:23:18','2026-04-21 00:23:18'),(7,1,'2026-04-12',4,3,3,4,3,2,1,2,2,1,29,'high','2026-04-21 00:39:00','2026-04-21 00:39:00');
/*!40000 ALTER TABLE `pss10_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','pa','admin') NOT NULL,
  `created_at` datetime NOT NULL,
  `gender` enum('L','P') DEFAULT NULL,
  `age` int DEFAULT NULL,
  `university` varchar(255) DEFAULT NULL,
  `major` varchar(255) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `residential_status` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `pa_id` int DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `pa_id` (`pa_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`pa_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mahasigmaa abiz','student@example.com','scrypt:32768:8:1$Nnh1wjYYBEjx4H9S$a4a793053005dc4d7a50f4d425e36eb32af06f415f9a4d65dfdd46bebe34420c40a68f4fc8590265310077ff8f7358a31ce0e646c95d0e395b0ca1031c15589f','student','2026-04-11 07:44:03','L',20,'Universitas Kebangsaan','Teknik Informatika',4,'Kos','6281363708167',NULL,NULL),(2,'Admin','admin@example.com','scrypt:32768:8:1$30OBihlIcTnX6pJN$013f6cfc9dc5443154283c84aba1f7d30f24ffbfb3d0b5ed4c5ee7c6a7c92c2e1db935edb6a306d995bb2622842c5eedd3f58017760d4e8846a3b25ced6a10b7','admin','2026-04-11 07:44:06',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'PA','pa@example.com','scrypt:32768:8:1$1SD8FWtvDcNdT7Go$94f05adc875092decdd70ca505bb3b52affa2541da1ff6254418de42190d1225a7c4c4af454e0954d4dc572c423babde29053538b6e1390fc93c9dc6a0b918df','pa','2026-04-11 07:44:09','P',NULL,'Universitas Kebangsaan',NULL,NULL,NULL,NULL,NULL,NULL),(4,'Student','student2@example.com','scrypt:32768:8:1$D98eqiQq00MOF57s$78dc4ecdea1f08baa83ba8d5989b159d6b23ba9291fac76f202d995488a450784122e620b192c45e13b6328fdd71694ff4f16984a720f83e73bf25d2f81d49e0','student','2026-04-20 15:32:38','L',21,'Universitas Kebangsaan','Teknik Informatika',4,'Kos','',NULL,'/static/uploads/Student_20260420_170201.webp'),(7,'Muhamad Reza','mhdrezaa095@gmail.com','scrypt:32768:8:1$0B0gm4XneFbL8xEQ$6de6b4b7dc248e62e59a3418b838f75f7bd03464b406cecc44ba50b64989ae0f70525c38bc55e567aad8575f3dc9cf0da005acdf2335176e36533cd2bf6bafa0','student','2026-04-20 18:07:44',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21  2:52:42
