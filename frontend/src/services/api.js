const API_BASE_URL = 'http://localhost:5000/api';

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.mensaje || `Error en la solicitud: ${res.status}`);
  }
  // Si viene envuelto en { data: [...] }, extrae el arreglo para los componentes
  if (data && data.data && Array.isArray(data.data)) {
    return data.data;
  }
  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token') || localStorage.getItem('token_gfa') || localStorage.getItem('gfa_jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token && token !== 'null' && token !== 'undefined') {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

export async function fetchGaleria() { return parseResponse(await fetch(`${API_BASE_URL}/galeria`)); }
export async function fetchSuites() { return parseResponse(await fetch(`${API_BASE_URL}/suites`)); }
export async function fetchOfertas() { return parseResponse(await fetch(`${API_BASE_URL}/ofertas`)); }
export async function fetchRestaurantes() { return parseResponse(await fetch(`${API_BASE_URL}/restaurantes`)); }
export async function fetchExperiencias() { return parseResponse(await fetch(`${API_BASE_URL}/experiencias`)); }
export async function fetchEspaciosEventos() { return parseResponse(await fetch(`${API_BASE_URL}/eventos/espacios`)); }

// 2. Experiencias
export async function reservarExperienciaApi(datosReserva) {
  const res = await fetch(`${API_BASE_URL}/experiencias/reservar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosReserva)
  });
  return parseResponse(res);
}

export async function obtenerExperienciasUsuarioApi(usuarioId) {
  return parseResponse(await fetch(`${API_BASE_URL}/experiencias/usuario/${usuarioId}`, {
    headers: getAuthHeaders()
  }));
}

// 3. Eventos MICE
export async function cotizarEventoApi(datosCotizacion) {
  const res = await fetch(`${API_BASE_URL}/eventos/cotizar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosCotizacion)
  });
  return parseResponse(res);
}

// 4. Autenticación & Perfil
export async function loginUsuarioApi(credenciales) {
  const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales)
  });
  const data = await parseResponse(res);
  if (data.token) {
    localStorage.setItem('gfa_jwt_token', data.token);
  }
  return data;
}

export async function registrarUsuarioApi(datosUsuario) {
  const res = await fetch(`${API_BASE_URL}/usuarios/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosUsuario)
  });
  const data = await parseResponse(res);
  if (data.token) {
    localStorage.setItem('gfa_jwt_token', data.token);
  }
  return data;
}

export async function obtenerPerfilSocioApi(usuarioId) {
  return parseResponse(await fetch(`${API_BASE_URL}/usuarios/perfil/${usuarioId}`, {
    headers: getAuthHeaders()
  }));
}

export async function actualizarPerfilSocioApi(usuarioId, datosActualizados) {
  const res = await fetch(`${API_BASE_URL}/usuarios/perfil/${usuarioId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosActualizados)
  });
  return parseResponse(res);
}

// 5. Reservaciones Suites
export async function createReservation(reservationData) {
  const res = await fetch(`${API_BASE_URL}/reservaciones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reservationData)
  });
  return parseResponse(res);
}

export async function obtenerHistorialReservacionesApi(usuarioId) {
  return parseResponse(await fetch(`${API_BASE_URL}/reservaciones/usuario/${usuarioId}`, {
    headers: getAuthHeaders()
  }));
}

export async function cancelarReservacionApi(reservacionId) {
  return parseResponse(await fetch(`${API_BASE_URL}/reservaciones/${reservacionId}/cancelar`, { 
    method: 'PUT',
    headers: getAuthHeaders()
  }));
}

export async function purgarCancelacionesApi(usuarioId) {
  return parseResponse(await fetch(`${API_BASE_URL}/reservaciones/canceladas/usuario/${usuarioId}`, { 
    method: 'DELETE',
    headers: getAuthHeaders()
  }));
}

// 6. Buscador por Folio
export async function buscarReservacionPorFolioApi(folio, emailOApellido) {
  const res = await fetch(`${API_BASE_URL}/reservaciones/buscar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folio, email_o_apellido: emailOApellido })
  });
  return parseResponse(res);
}

// 7. Contacto
export async function createContactTicket(ticketData) {
  const token = localStorage.getItem('token_gfa') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/contacto`, {
    method: 'POST',
    headers,
    body: JSON.stringify(ticketData)
  });
  return parseResponse(res);
}

export async function obtenerTicketsUsuarioApi(usuarioId) {
  return parseResponse(await fetch(`${API_BASE_URL}/contacto/usuario/${usuarioId}`, {
    headers: getAuthHeaders()
  }));
}
// Consulta de reservación por folio y correo
export const fetchReservationByFolio = async (folio, email) => {
  const params = new URLSearchParams();
  if (folio) params.append('folio', folio);
  if (email) params.append('email', email);

  const res = await fetch(`http://localhost:5000/api/reservaciones/buscar?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'No se encontró la reservación');
  }
  const data = await res.json();
  return data.data || data;
};

// Obtener Fiesta Americana CARD oficial del usuario
export const fetchFiestaCard = async (usuarioId) => {
  const res = await fetch(`http://localhost:5000/api/tarjeta-fiesta/${usuarioId}`);
  if (!res.ok) throw new Error('Error al consultar Fiesta Card');
  const json = await res.json();
  return json.data;
};


