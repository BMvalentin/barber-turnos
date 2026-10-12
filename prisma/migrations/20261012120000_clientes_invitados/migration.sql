-- Los clientes cargados desde el panel no son cuentas de acceso.
ALTER TABLE `user`
  ADD COLUMN `esInvitado` BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN `emailContacto` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `user_emailContacto_key` ON `user`(`emailContacto`);

-- Conserva los datos registrados por el personal aunque el cliente vincule su cuenta después.
ALTER TABLE `turno`
  ADD COLUMN `clienteNombre` VARCHAR(191) NULL,
  ADD COLUMN `clienteApellido` VARCHAR(191) NULL,
  ADD COLUMN `clienteTelefono` VARCHAR(191) NULL,
  ADD COLUMN `clienteEmail` VARCHAR(191) NULL;
