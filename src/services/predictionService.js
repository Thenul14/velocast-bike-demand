export async function requestPrediction(inputs, signal) {
  const response = await fetch('/api/predict', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs), signal,
  });
  let data;
  try { data = await response.json(); }
  catch { throw new Error('The prediction service is unavailable. Please try again.'); }
  if (!response.ok) throw new Error(data.error || 'Prediction failed. Please try again.');
  if (!Number.isFinite(data.predicted_count) || !Array.isArray(data.hourly) || data.hourly.length !== 24) {
    throw new Error('Unexpected response from the prediction service.');
  }
  return data;
}
