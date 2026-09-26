-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('USER', 'ADMIN', 'EMPLEADO') NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE `barbero` ADD COLUMN `usuarioId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `barbero_usuarioId_key` ON `barbero`(`usuarioId`);
