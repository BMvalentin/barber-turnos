-- Agregar datos opcionales para transferencias bancarias sin modificar datos existentes.
ALTER TABLE `turno`
    ADD COLUMN `metodoPago` VARCHAR(20) NULL;

ALTER TABLE `PageConfig`
    ADD COLUMN `transferenciaTitular` VARCHAR(191) NULL,
    ADD COLUMN `transferenciaCuit` VARCHAR(191) NULL,
    ADD COLUMN `transferenciaAlias` VARCHAR(191) NULL,
    ADD COLUMN `transferenciaCbu` VARCHAR(191) NULL,
    ADD COLUMN `transferenciaBanco` VARCHAR(191) NULL;
