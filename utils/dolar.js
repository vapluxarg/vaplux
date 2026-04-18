export async function getDolarBlue() {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/blue', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('API fetching failed');
    const data = await res.json();
    return data.venta || 1200; // Fallback si la respuesta no tiene 'venta'
  } catch (err) {
    console.error('Error fetching DolarAPI:', err);
    return 1200; // Valor de fallback seguro por si se cae la API
  }
}

export async function getUsdtRate() {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/cripto', { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error('API fetching failed');
    const data = await res.json();
    return data.venta || 1250; // Fallback razonable para USDT
  } catch (err) {
    console.error('Error fetching USDT rate:', err);
    return 1250;
  }
}
