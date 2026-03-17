-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Tempo de geração: 15-Mar-2026 às 01:15
-- Versão do servidor: 8.4.8
-- versão do PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de dados: `wildlog`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `posts`
--

CREATE TABLE `posts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `visibility` enum('private','public') DEFAULT 'private',
  `status` enum('draft','pending_review','approved','rejected') DEFAULT 'draft',
  `environmental_validated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `title`, `description`, `lat`, `lng`, `visibility`, `status`, `environmental_validated_at`, `created_at`) VALUES
(8, 6, 'Neves', 'nevada radical', 45.4971600, 76.2588800, 'public', 'pending_review', NULL, '2026-03-15 01:13:09'),
(9, 6, 'Neves', 'nevada radical', 45.4971600, 76.2588800, 'public', 'pending_review', NULL, '2026-03-15 01:13:57');

-- --------------------------------------------------------

--
-- Estrutura da tabela `post_bookmark`
--

CREATE TABLE `post_bookmark` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `post_comments`
--

CREATE TABLE `post_comments` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comment` text NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `post_images`
--

CREATE TABLE `post_images` (
  `id` int NOT NULL,
  `post_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `position` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `post_images`
--

INSERT INTO `post_images` (`id`, `post_id`, `image_url`, `position`) VALUES
(6, 8, '/backend/upload/user/post/8/8_69b607a5c50466.83376016.webp', 0),
(7, 9, '/backend/upload/user/post/9/9_69b607d55c6107.79373618.webp', 0);

-- --------------------------------------------------------

--
-- Estrutura da tabela `post_likes`
--

CREATE TABLE `post_likes` (
  `user_id` int NOT NULL,
  `post_id` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `post_tags`
--

CREATE TABLE `post_tags` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `post_tags`
--

INSERT INTO `post_tags` (`id`, `name`) VALUES
(6, 'luxo'),
(5, 'natureza');

-- --------------------------------------------------------

--
-- Estrutura da tabela `post_tag_rel`
--

CREATE TABLE `post_tag_rel` (
  `post_id` int NOT NULL,
  `tag_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `post_tag_rel`
--

INSERT INTO `post_tag_rel` (`post_id`, `tag_id`) VALUES
(8, 5),
(9, 5),
(8, 6);

-- --------------------------------------------------------

--
-- Estrutura da tabela `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `role` enum('base','vip') NOT NULL DEFAULT 'base',
  `description` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password`, `role`, `description`, `avatar`, `email_verified_at`, `created_at`) VALUES
(1, 'admin', 'admin', 'admin@gmail.com', '$2a$12$MEgc0HkZIF6r5SL7DFizb.5UjNdoJ/WRkR.QnKDSVpY/PfLkMKaTq', 'base', NULL, 'upload/user/avatar/1/avatar.jpg', '2026-02-26 18:42:44', '2026-02-26 18:40:16'),
(6, 'miguelac4', 'Miguel Cordeiro', 'miguel.andre.cordeiro@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$OEFsMlFEelVWTkF1UEduLg$hFImcvOS2Bqich35iSbyBjVSWOWJgqJWchp+y58d1W0', 'base', NULL, NULL, '2026-02-27 10:06:46', '2026-02-27 10:02:41'),
(13, 'lenodrack', 'LenoDrack', 'lenodrack@gmail.com', '$argon2id$v=19$m=65536,t=4,p=1$Y29rMk5GTjZRY1g2ZFNUYg$mBLq6NQVdoEc7mvuTfXadYwBwvRd3bB8Bp7CNSZhQiI', 'base', NULL, NULL, '2026-03-06 17:42:37', '2026-03-06 17:39:47'),
(14, 'miguelac3', NULL, 'miguel.andre@gmail.com', '$2y$10$dmruZCnTqZiYRLGENt0Y2ukCO2obpm6nKK4nG.0Q/YHvJ94.Ww2zm', 'base', NULL, NULL, '2026-03-11 20:07:59', '2026-03-09 20:04:30'),
(15, 'miguelacgt4', NULL, 'miguel.andre.cdordeiro@gmail.com', '$2y$10$s8BBI7rdv2TLdPoY2T031.E9urynLn0ony0vrCs3b/3.pbzJ6rzYa', 'base', NULL, NULL, NULL, '2026-03-10 11:33:12'),
(16, 'miguelacfs4', NULL, 'miguel.andrdasdae.cordeiro@gmail.com', '$2y$10$EHFkhvCySigM.4VkcapTdeGw0c0UdE3bI35r06MtCDl/q5epezqnq', 'base', NULL, NULL, NULL, '2026-03-10 11:35:51');

-- --------------------------------------------------------

--
-- Estrutura da tabela `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('email','resetPass') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Extraindo dados da tabela `user_tokens`
--

INSERT INTO `user_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `consumed_at`, `created_at`, `type`) VALUES
(20, 6, 'a5abbbf367315bc3e5d4d37f3d275c3853f172818842672dc93ab02d6d29f7ac', '2026-02-28 10:02:41', '2026-02-27 10:06:46', '2026-02-27 10:02:41', 'email'),
(21, 6, '17c2d347e44ca059681dcf6344b1a4ee8fb64dbb2f2ac922424123705a963f23', '2026-02-28 17:29:16', '2026-03-04 17:18:24', '2026-02-27 17:29:16', 'resetPass'),
(22, 6, '20bcbacd49a296ca4dc6136f13bb7a57eb9d98ac9ff9463c95d7f53ea7f2f6cc', '2026-03-05 17:18:24', '2026-03-04 17:20:36', '2026-03-04 17:18:24', 'resetPass'),
(23, 6, 'be82ce5ec6f8ccb466f9ed8450f342ca29ecf2cdadd177a847783752a2ef945a', '2026-03-05 17:20:36', '2026-03-04 17:22:24', '2026-03-04 17:20:36', 'resetPass'),
(24, 6, '75d6b339f085e34cde61a2bd9b597be0db4ba61ca65e2452ec0166bbcb1ad9ea', '2026-03-05 17:22:24', '2026-03-04 17:23:10', '2026-03-04 17:22:24', 'resetPass'),
(25, 6, '1d6af8536a6920acc93a3e7744aead3dee921aaae4490bb439c6e6f1324e5e95', '2026-03-05 17:23:10', '2026-03-04 17:23:55', '2026-03-04 17:23:10', 'resetPass'),
(26, 6, '4dd0537c4b8cb230dd82512fb6f2ce7f8a798f80c84b011e6f6a5c7538825a34', '2026-03-05 17:23:55', '2026-03-04 17:33:02', '2026-03-04 17:23:55', 'resetPass'),
(27, 6, '0f3eda4b2e67f13fcfa9db4b9aedc4291f7154a92f6d321e6243fd09cbda37b2', '2026-03-05 17:33:02', '2026-03-04 17:47:49', '2026-03-04 17:33:02', 'resetPass'),
(34, 13, '7eb87e06752e732942e963fd47b22ac8ba72c4121e66dbf52a89f8576c95b4e4', '2026-03-07 17:39:47', '2026-03-06 17:42:37', '2026-03-06 17:39:47', 'email'),
(35, 13, '5cc925a5b369e198c3e66f94406e1a4300e681a2adb7fb833d2336f9e739c7cf', '2026-03-08 12:36:09', '2026-03-07 12:52:49', '2026-03-07 12:36:09', 'resetPass'),
(36, 6, 'acdda97676f55aa3466e9cbd52eed390008f0bbde3c89b57dfca85b83b365f32', '2026-03-08 13:09:54', '2026-03-07 13:27:00', '2026-03-07 13:09:54', 'resetPass'),
(37, 14, '40c6ca660b195aff0af7ecb9b5ce8500139a547826b3a731868f986f859ece5c', '2026-03-10 20:04:30', NULL, '2026-03-09 20:04:30', 'email'),
(38, 15, 'd8aa6bbeb27200809eefc753e02d4fb9bb36da33d3b5f1b7c75f913902404919', '2026-03-11 11:33:12', NULL, '2026-03-10 11:33:12', 'email'),
(39, 16, '4e7a74c39546d853ccfc585c6ab354163197c0db90f99de7847fda9a4e08f824', '2026-03-11 11:35:51', NULL, '2026-03-10 11:35:51', 'email');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices para tabela `post_bookmark`
--
ALTER TABLE `post_bookmark`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Índices para tabela `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices para tabela `post_images`
--
ALTER TABLE `post_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`);

--
-- Índices para tabela `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Índices para tabela `post_tags`
--
ALTER TABLE `post_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Índices para tabela `post_tag_rel`
--
ALTER TABLE `post_tag_rel`
  ADD PRIMARY KEY (`post_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Índices para tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Índices para tabela `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_tokens_user` (`user_id`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `post_images`
--
ALTER TABLE `post_images`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `post_tags`
--
ALTER TABLE `post_tags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `post_bookmark`
--
ALTER TABLE `post_bookmark`
  ADD CONSTRAINT `post_bookmark_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_bookmark_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `post_comments`
--
ALTER TABLE `post_comments`
  ADD CONSTRAINT `post_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `post_images`
--
ALTER TABLE `post_images`
  ADD CONSTRAINT `post_images_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `post_tag_rel`
--
ALTER TABLE `post_tag_rel`
  ADD CONSTRAINT `post_tag_rel_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_tag_rel_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `post_tags` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
