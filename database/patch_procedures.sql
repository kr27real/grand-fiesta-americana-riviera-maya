USE [HotelGranFiestaAmericanaDB];
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_ObtenerHistorialReservaciones]
    @UsuarioID INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.reservacion_id,
        r.folio_confirmacion AS folio,
        r.fecha_llegada AS fecha_checkin,
        r.fecha_salida AS fecha_checkout,
        r.noches,
        (r.adultos + r.ninos) AS total_huespedes,
        r.adultos,
        r.ninos,
        r.subtotal,
        r.total_general AS total,
        r.estatus_reservacion AS estado,
        r.creado_en,
        s.nombre AS nombre_suite,
        s.tipo_cama,
        s.foto_principal AS imagen_suite
    FROM dbo.Reservaciones r
    INNER JOIN dbo.HabitacionesSuites s ON r.suite_id = s.suite_id
    WHERE r.usuario_id = @UsuarioID
    ORDER BY r.creado_en DESC;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CrearTicketContacto]
    @hotel_destino VARCHAR(150),
    @categoria VARCHAR(100),
    @tipo_solicitud VARCHAR(100),
    @clave_reservacion VARCHAR(50) = NULL,
    @nombres VARCHAR(100),
    @apellidos VARCHAR(100),
    @email VARCHAR(150),
    @telefono VARCHAR(50),
    @descripcion VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.TicketsContacto (
        hotel_destino, categoria, tipo_solicitud, clave_reservacion, 
        nombres, apellidos, email, telefono, descripcion, estatus, creado_en
    )
    VALUES (
        @hotel_destino, @categoria, @tipo_solicitud, @clave_reservacion, 
        @nombres, @apellidos, @email, @telefono, @descripcion, 'Pendiente', GETDATE()
    );

    SELECT SCOPE_IDENTITY() AS ticket_id;
END;
GO
