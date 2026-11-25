import React from 'react';
import { formatHour } from './PredictionForm.jsx';
export default function HourlyChart({ data, selected }) {
  const max = Math.max(100, Math.ceil(Math.max(...data.map(d => d.count))/100)*100);
  const grid = Array.from({length:5},(_,i)=>max*i/4);
  return <div className="chart-wrap" role="img" aria-label={`Predicted hourly demand under fixed weather, selected hour ${formatHour(selected)}. Peak ${Math.round(Math.max(...data.map(d=>d.count)))} rentals.`}>
    <div className="chart-y">{grid.slice().reverse().map(v => <span key={v}>{Math.round(v)}</span>)}</div>
    <div className="plot"><div className="grid-lines">{grid.map(v=><div key={v}/>)}</div><div className="bars">{data.map(d => <div className="bar-slot" key={d.hour}><div className={`bar ${d.hour === selected ? 'selected' : ''}`} style={{height:`${Math.max(0,d.count/max*100)}%`}} title={`${formatHour(d.hour)} · ${Math.round(d.count)} rentals`}/></div>)}</div><div className="chart-x">{[0,6,12,18,23].map(h=><span key={h}>{formatHour(h)}</span>)}</div></div>
  </div>;
}
