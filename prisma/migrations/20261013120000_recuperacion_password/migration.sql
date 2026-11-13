-- Almacena los tokens de verificación y restablecimiento definidos en Prisma.
-- relationMode = "prisma": la relación con user no crea una clave foránea SQL.
CREATE TABLE `verificacion_usuario` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `verificacion_usuario_token_key`(`token`),
    INDEX `verificacion_usuario_identifier_idx`(`identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
