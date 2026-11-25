import React from 'react';
import Icon from './Icon.jsx';
export const DEFAULT_INPUTS = { date: '2012-07-15', hour: 17, weather: 1, temp: 24, atemp: 26, humidity: 65, windspeed: 12 };
export const WEATHER = ['Clear / partly cloudy', 'Mist / cloudy', 'Light rain / snow', 'Severe rain / snow'];
export const formatHour = h => `${String(h).padStart(2, '0')}:00`;
function Range({ name, label, value, min, max, step, unit, onChange }) {
  return <label className="range-field" htmlFor={name}>
    <span className="range-label"><span>{label}</span><output htmlFor={name}>{value}{unit}</output></span>
    <input id={name} name={name} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(name, Number(e.target.value))} style={{'--progress': `${(value-min)/(max-min)*100}%`}} />
    <span className="range-scale"><span>{min}{unit}</span><span>{max}{unit}</span></span>
  </label>;
}
export default function PredictionForm({ values, onChange, onSubmit, onReset, busy }) {
  return <section className="panel form-panel" aria-labelledby="scenario-heading">
    <div className="panel-head"><div className="section-icon"><Icon name="calendar"/></div><div><h2 id="scenario-heading">Configure scenario</h2><p>Set the conditions for an hourly prediction.</p></div></div>
    <form onSubmit={onSubmit}>
      <fieldset disabled={busy}>
        <div className="section-label">01 <span>DATE &amp; TIME</span></div>
        <div className="form-row">
          <label className="field">Historical date<input type="date" required min="2011-01-01" max="2012-12-31" value={values.date} onChange={e => onChange('date', e.target.value)}/></label>
          <label className="field">Hour<select value={values.hour} onChange={e => onChange('hour', Number(e.target.value))}>{Array.from({length:24}, (_, h) => <option key={h} value={h}>{formatHour(h)}</option>)}</select></label>
        </div>
        <p className="field-note">Season, weekday, holiday and working day are derived from the original dataset.</p>
        <div className="section-label weather-label">02 <span>WEATHER CONDITIONS</span></div>
        <label className="field">Weather<select value={values.weather} onChange={e => onChange('weather', Number(e.target.value))}>{WEATHER.map((label, i) => <option value={i+1} key={label}>{label}</option>)}</select></label>
        <div className="range-grid">
          <Range name="temp" label="Temperature" value={values.temp} min={-8} max={39} step={0.5} unit="°C" onChange={onChange}/>
          <Range name="atemp" label="Feels like" value={values.atemp} min={-16} max={50} step={0.5} unit="°C" onChange={onChange}/>
          <Range name="humidity" label="Humidity" value={values.humidity} min={0} max={100} step={1} unit="%" onChange={onChange}/>
          <Range name="windspeed" label="Wind speed" value={values.windspeed} min={0} max={67} step={1} unit=" km/h" onChange={onChange}/>
        </div>
        <div className="form-actions"><button className="primary" type="submit">{busy ? 'Running prediction…' : 'Predict demand'}{busy ? <span className="spinner"/> : <Icon name="arrow" size={19}/>}</button><button className="reset" type="button" onClick={onReset} title="Reset inputs"><Icon name="reset" size={18}/> Reset</button></div>
      </fieldset>
    </form>
  </section>;
}
