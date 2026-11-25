ALTER TABLE `turno` ADD COLUMN `recordatorioPushPara` DATETIME(3) NULL;

CREATE TABLE `suscripcion_push` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endpointHash` CHAR(64) NOT NULL,
    `endpoint` TEXT NOT NULL,
    `clavePublica` VARCHAR(87) NOT NULL,
    `auth` VARCHAR(22) NOT NULL,
    `claveVapid` VARCHAR(87) NOT NULL,
    `actualizadoEn` DATETIME(3) NOT NULL,

    UNIQUE INDEX `suscripcion_push_endpointHash_key`(`endpointHash`),
    INDEX `suscripcion_push_userId_claveVapid_idx`(`userId`, `claveVapid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
