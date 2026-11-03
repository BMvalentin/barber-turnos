-- Registro auditable de aceptaciones legales por usuario.
-- Aditiva: no modifica ni elimina tablas ni filas existentes. relationMode = "prisma",
-- por lo que la relacion no se materializa como clave foranea.
CREATE TABLE `consentimiento_legal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `documento` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `aceptadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metodo` VARCHAR(191) NOT NULL,

    INDEX `consentimiento_legal_userId_documento_idx`(`userId`, `documento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
