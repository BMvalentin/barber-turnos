-- Permite activar u ocultar la transferencia bancaria sin borrar sus datos.
ALTER TABLE `PageConfig`
    ADD COLUMN `transferenciaActiva` BOOLEAN NOT NULL DEFAULT true;
