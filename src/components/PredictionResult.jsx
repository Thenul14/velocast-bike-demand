import React from 'react';
import Icon from './Icon.jsx';
import HourlyChart from './HourlyChart.jsx';
import { formatHour, WEATHER } from './PredictionForm.jsx';
const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
export default function PredictionResult({ result, scenario, busy, stale, error }) {
  const peak = result?.hourly.reduce((a,b) => a.count >= b.count ? a : b);
  return <section className="results" aria-labelledby="result-heading" aria-live="polite">
    <div className="panel result-panel">
      <div className="panel-head result-head"><div className="section-icon"><Icon name="chart"/></div><div><h2 id="result-heading">Demand forecast</h2><p>Model-generated estimate for your scenario.</p></div><span className={`state ${result && !stale ? 'ready' : ''}`}><i/>{busy ? 'Running' : result ? stale ? 'Previous result' : 'Complete' : 'Ready'}</span></div>
      {error && <div className="error" role="alert">{error}</div>}
      {!result ? <div className="empty-result"><div className="empty-icon"><Icon name="bike" size={45}/></div><h3>{busy ? 'Calculating demand' : 'Your prediction appears here'}</h3><p>{busy ? 'The model is evaluating your selected conditions.' : 'Configure a scenario and select Predict demand to run the original trained model.'}</p></div> : <>
        <div className="prediction-value"><span className="eyebrow">ESTIMATED HOURLY RENTALS</span><div><strong>{Math.round(result.predicted_count).toLocaleString('en-GB')}</strong><span> bikes</span></div><p>{scenario.date} · {formatHour(scenario.hour)} · {WEATHER[scenario.weather-1]}</p></div>
        <div className="mini-metrics"><div><span>Season (dataset)</span><strong>{seasons[result.context.season-1]}</strong></div><div><span>Day type</span><strong>{result.context.holiday ? 'Holiday' : result.context.workingday ? 'Working day' : 'Non-working day'}</strong></div><div><span>Scenario peak</span><strong>{formatHour(peak.hour)}</strong></div></div>
        {stale && <p className="stale-note">Inputs have changed. Run another prediction to update these results.</p>}
      </>}
    </div>
    <div className="panel chart-panel"><div className="chart-head"><div><h2>Hourly demand profile</h2><p>Predicted rentals throughout the selected day.</p></div><span className="legend"><i/> Selected hour</span></div>{result ? <HourlyChart data={result.hourly} selected={result.hour}/> : <div className="empty-chart"><span>24-hour profile will appear after prediction</span></div>}<p className="chart-note"><Icon name="info" size={15}/> Weather is held constant for all 24 estimates; this is not a live forecast.</p></div>
  </section>;
}
