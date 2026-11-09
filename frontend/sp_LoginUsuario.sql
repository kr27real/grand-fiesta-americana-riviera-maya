USE HotelGranFiestaAmericanaDB;
GO

CREATE OR ALTER PROCEDURE sp_LoginUsuario
    @Correo VARCHAR(150),
    @PasswordHash VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Validar si el usuario existe con las credenciales correctas
    IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Correo = @Correo AND PasswordHash = @PasswordHash)
    BEGIN
        RAISERROR('Correo electrónico o contraseña incorrectos.', 16, 1);
        RETURN;
    END

    -- Retornar todos los datos del socio autenticado
    SELECT * 
    FROM Usuarios 
    WHERE Correo = @Correo AND PasswordHash = @PasswordHash;
END
GO
