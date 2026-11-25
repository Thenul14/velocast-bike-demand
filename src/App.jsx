import React, { useState, useRef, useEffect } from 'react';
import Icon from './components/Icon.jsx';
import PredictionForm, { DEFAULT_INPUTS } from './components/PredictionForm.jsx';
import PredictionResult from './components/PredictionResult.jsx';
import { requestPrediction } from './services/predictionService.js';

export default function App() {
  const [values, setValues] = useState({...DEFAULT_INPUTS});
  const [result, setResult] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(null);
  useEffect(() => () => active.current?.abort(), []);
  const stale = result && JSON.stringify(values) !== JSON.stringify(scenario);
  function change(name, value) { setValues(old => ({...old, [name]:value})); setError(''); }
  function reset() { active.current?.abort(); active.current = null; setValues({...DEFAULT_INPUTS}); setResult(null); setScenario(null); setError(''); setBusy(false); }
  async function submit(e) {
    e.preventDefault();
    if (active.current) return;
    const controller = new AbortController(); active.current = controller;
    const snapshot = {...values}; setBusy(true); setError('');
    let timeout = false;
    const timer = setTimeout(() => { timeout = true; controller.abort(); }, 65000);
    try { const data = await requestPrediction(snapshot, controller.signal); if (active.current === controller) { setResult(data); setScenario(snapshot); } }
    catch (err) { if (active.current === controller) setError(timeout ? 'The model took too long to respond. Please retry.' : err.message || 'Prediction failed.'); }
    finally { clearTimeout(timer); if (active.current === controller) { active.current = null; setBusy(false); } }
  }
  return <>
    <header className="header"><div className="header-inner"><a className="brand" href="/" aria-label="VeloCast home"><span className="logo"><Icon name="bike" size={27}/></span><span>VeloCast<span className="brand-dot">.</span><small>DEMAND INTELLIGENCE</small></span></a><nav><a href="#predict">Predict</a><a href="#model">Model details</a></nav><span className="header-tag"><i/> ML portfolio demo</span></div></header>
    <main className="container">
      <section className="hero"><div><div className="hero-kicker"><span/> MACHINE LEARNING · MOBILITY ANALYTICS</div><h1>Bike demand,<br className="mobile-break"/> <em>made predictable.</em></h1><p>Explore how time, weather and season influence hourly bike rentals using a trained machine learning model.</p></div><div className="hero-mark" aria-hidden="true"><Icon name="bike" size={64}/><span>CAPITAL BIKESHARE<br/>WASHINGTON, DC</span></div></section>
      <section className="stats" aria-label="Archived model performance"><div className="stat"><span className="stat-label"><Icon name="layers" size={17}/> ALGORITHM</span><strong>Random Forest</strong><small>100 decision trees</small></div><div className="stat"><span className="stat-label"><Icon name="chart" size={17}/> TEST R²</span><strong>0.9458</strong><small>Original held-out test score</small></div><div className="stat"><span className="stat-label"><Icon name="check" size={17}/> TEST MAE</span><strong>24.58 <span>rentals</span></strong><small>Mean absolute error</small></div><div className="stat"><span className="stat-label"><Icon name="calendar" size={17}/> DATA PERIOD</span><strong>2011–2012</strong><small>Historical dataset</small></div></section>
      <div id="predict" className="workspace-heading"><h2>Prediction workspace</h2><span>01 / INTERACTIVE DEMO</span></div>
      <div className="workspace"><PredictionForm values={values} onChange={change} onSubmit={submit} onReset={reset} busy={busy}/><PredictionResult result={result} scenario={scenario} busy={busy} stale={stale} error={error}/></div>
      <section id="model" className="panel model-panel"><div className="panel-head"><div className="section-icon"><Icon name="info"/></div><div><h2>About the model</h2><p>Original trained model, deployed for inference.</p></div></div><div className="model-columns"><div><h3>From MLOps to an interactive demo</h3><p>The model comes from a university group project that used Apache Airflow, MariaDB, Redis, MLflow and scikit-learn. This independent deployment uses the saved Random Forest directly, without rerunning the training pipeline.</p><div className="tags"><span>React</span><span>Python</span><span>scikit-learn</span><span>Vercel</span></div></div><div><h3>How to interpret predictions</h3><p>The model was trained on 2011–2012 Washington, DC data. The archived R² and MAE describe the original test split, not current performance. Results are estimates for historical scenarios, not live bike availability or modern demand forecasts.</p><a href="https://doi.org/10.24432/C5W894" target="_blank" rel="noreferrer">View original dataset ↗</a></div></div></section>
      <footer><span>VeloCast · Machine learning portfolio project</span><span>Historical simulation · No live data</span></footer>
    </main>
  </>;
}
