CREATE TABLE `users` (
                         `id` INT NOT NULL AUTO_INCREMENT,
                         `name` VARCHAR(255) NOT NULL,
                         `email` VARCHAR(255) NOT NULL,
                         `password_hash` VARCHAR(255) NOT NULL,
                         `role` ENUM('base', 'vip') NOT NULL DEFAULT 'base',
                         `description` VARCHAR(255) NULL,
                         `avatar` VARCHAR(255) NULL,
                         `email_verified_at` DATETIME NULL,
                         `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB;

CREATE TABLE `user_tokens` (
                               `id` INT NOT NULL AUTO_INCREMENT,
                               `user_id` INT NOT NULL,
                               `token_hash` VARCHAR(255) NOT NULL,
                               `expires_at` DATETIME NOT NULL,
                               `consumed_at` DATETIME NULL,
                               `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               `type` ENUM('email', 'resetPass') NOT NULL,
                               PRIMARY KEY (`id`),
                               CONSTRAINT `fk_user_tokens_user`
                                   FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
                                       ON DELETE CASCADE
                                       ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `post` (
                        `id` INT NOT NULL AUTO_INCREMENT,
                        `author_id` INT NOT NULL,
                        `title` VARCHAR(255) NULL,
                        `description` VARCHAR(255) NULL,
                        `status` ENUM('private', 'public', 'deleted') NOT NULL DEFAULT 'public',
                        `environmentValidation` BOOLEAN NOT NULL DEFAULT 0,
                        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        PRIMARY KEY (`id`),
                        CONSTRAINT `fk_post_author`
                            FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
                                ON DELETE RESTRICT
                                ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `post_images` (
                               `id` INT NOT NULL AUTO_INCREMENT,
                               `post_id` INT NOT NULL,
                               `path` VARCHAR(255) NOT NULL,
                               PRIMARY KEY (`id`),
                               CONSTRAINT `fk_post_images_post`
                                   FOREIGN KEY (`post_id`) REFERENCES `post` (`id`)
                                       ON DELETE CASCADE
                                       ON UPDATE CASCADE
) ENGINE=InnoDB;