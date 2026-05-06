import { getApiErrorMessage } from '../utils/apiError';

describe('getApiErrorMessage', () => {
  it('returns timeout message for ECONNABORTED', () => {
    const message = getApiErrorMessage({ code: 'ECONNABORTED' });
    expect(message).toMatch(/tardó demasiado/i);
  });

  it('returns network message for Network Error', () => {
    const message = getApiErrorMessage({ message: 'Network Error' });
    expect(message).toMatch(/no hay conexión/i);
  });

  it('returns string response body when present', () => {
    const message = getApiErrorMessage({ response: { status: 400, data: 'Error plano' } });
    expect(message).toBe('Error plano');
  });

  it('returns detail string when present', () => {
    const message = getApiErrorMessage({ response: { status: 400, data: { detail: 'Detalle error' } } });
    expect(message).toBe('Detalle error');
  });

  it('joins detail array messages', () => {
    const message = getApiErrorMessage({
      response: { status: 400, data: { detail: ['A', { message: 'B' }] } },
    });
    expect(message).toBe('A B');
  });

  it('extracts nested serializer errors', () => {
    const message = getApiErrorMessage({
      response: {
        status: 400,
        data: {
          email: ['Email inválido'],
          preferences: { level: ['Nivel inválido'] },
        },
      },
    });
    expect(message).toMatch(/Email inválido/);
    expect(message).toMatch(/Nivel inválido/);
  });

  it('returns friendly 401 message', () => {
    const message = getApiErrorMessage({ response: { status: 401, data: {} } });
    expect(message).toMatch(/sesión inválida/i);
  });

  it('returns friendly 403 message', () => {
    const message = getApiErrorMessage({ response: { status: 403, data: {} } });
    expect(message).toMatch(/no tienes permiso/i);
  });

  it('returns friendly 500 message', () => {
    const message = getApiErrorMessage({ response: { status: 500, data: {} } });
    expect(message).toMatch(/error en el servidor/i);
  });

  it('returns fallback when nothing useful exists', () => {
    const message = getApiErrorMessage({ response: { status: 418, data: {} } }, 'Fallback custom');
    expect(message).toBe('Fallback custom');
  });
});
