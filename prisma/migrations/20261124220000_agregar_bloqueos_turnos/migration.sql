CREATE TABLE IF NOT EXISTS `SlotLock` (
    `id` VARCHAR(191) NOT NULL,
    `barberoId` VARCHAR(191) NOT NULL,
    `horarioReservado` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SlotLock_sessionId_key`(`sessionId`),
    INDEX `SlotLock_barberoId_horarioReservado_idx`(`barberoId`, `horarioReservado`),
    INDEX `SlotLock_expiresAt_idx`(`expiresAt`),
    INDEX `SlotLock_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Las bases sincronizadas previamente pueden tener la columna o el índice.
SET @ddl_bloqueos = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'turno'
          AND COLUMN_NAME = 'claveSlot'
          AND DATA_TYPE = 'varchar'
          AND CHARACTER_MAXIMUM_LENGTH = 120
          AND IS_NULLABLE = 'YES'
    ),
    'SELECT 1',
    'ALTER TABLE `turno` ADD COLUMN `claveSlot` VARCHAR(120) NULL'
);
PREPARE cambio_bloqueos FROM @ddl_bloqueos;
EXECUTE cambio_bloqueos;
DEALLOCATE PREPARE cambio_bloqueos;

SET @ddl_bloqueos = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'turno'
          AND INDEX_NAME = 'turno_claveSlot_key'
          AND NON_UNIQUE = 0
        GROUP BY INDEX_NAME
        HAVING COUNT(*) = 1
           AND MAX(COLUMN_NAME) = 'claveSlot'
           AND COUNT(SUB_PART) = 0
    ),
    'SELECT 1',
    'CREATE UNIQUE INDEX `turno_claveSlot_key` ON `turno`(`claveSlot`)'
);
PREPARE cambio_bloqueos FROM @ddl_bloqueos;
EXECUTE cambio_bloqueos;
DEALLOCATE PREPARE cambio_bloqueos;
