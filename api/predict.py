"""Vercel Python HTTP function: POST /api/predict, GET /api/predict for health."""
import gzip
import json
import logging
import math
import pickle
from datetime import date
from functools import lru_cache
from http.server import BaseHTTPRequestHandler
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT / 'models'
FEATURES = ['season', 'yr', 'mnth', 'day', 'hr', 'holiday', 'weekday', 'workingday',
            'weather_situation', 'temp', 'atemp', 'hum', 'windspeed']
MAX_BODY = 8192

@lru_cache(maxsize=1)
def calendar():
    return json.loads((MODEL_DIR / 'calendar.json').read_text(encoding='utf-8'))

@lru_cache(maxsize=1)
def load_model():
    # Only load the trusted, bundled original model, never a user-supplied pickle.
    with gzip.open(MODEL_DIR / 'random_forest.pkl.gz', 'rb') as f:
        model = pickle.load(f)
    if list(model.feature_names_in_) != FEATURES:
        raise RuntimeError('Model feature schema mismatch')
    model.n_jobs = 1
    return model

def numeric(payload, name, low, high, integer=False):
    value = payload.get(name)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f'{name} must be a number.')
    if not low <= value <= high or not math.isfinite(value):
        raise ValueError(f'{name} must be between {low} and {high}.')
    if integer and int(value) != value:
        raise ValueError(f'{name} must be an integer.')
    return int(value) if integer else float(value)

def feature_rows(payload):
    if not isinstance(payload, dict):
        raise ValueError('Expected a JSON object.')
    key = payload.get('date')
    if not isinstance(key, str) or key not in calendar():
        raise ValueError('Choose a date between 2011-01-01 and 2012-12-31.')
    d = date.fromisoformat(key)
    h = numeric(payload, 'hour', 0, 23, True)
    context = dict(calendar()[key])
    weather = numeric(payload, 'weather', 1, 4, True)
    temp = numeric(payload, 'temp', -8, 39)
    atemp = numeric(payload, 'atemp', -16, 50)
    hum = numeric(payload, 'humidity', 0, 100)
    wind = numeric(payload, 'windspeed', 0, 67)
    # The archived Random Forest training code de-normalised the original CSV:
    # temp = temp * 47 - 8, atemp = atemp * 66 - 16,
    # hum = hum * 100, windspeed = windspeed * 67.
    # The form already provides these training-scale values; no second scaling.
    rows = [{**context, 'day': d.day, 'hr': hour, 'weather_situation': weather,
             'temp': temp, 'atemp': atemp, 'hum': hum, 'windspeed': wind}
            for hour in range(24)]
    return h, context, pd.DataFrame(rows, columns=FEATURES)

def predict(payload):
    hour, context, frame = feature_rows(payload)
    values = load_model().predict(frame)
    return {'predicted_count': float(values[hour]),
            'hourly': [{'hour': h, 'count': float(v)} for h, v in enumerate(values)],
            'context': context, 'model': 'Random Forest Regressor',
            'date': payload['date'], 'hour': hour}

class handler(BaseHTTPRequestHandler):
    def reply(self, status, payload):
        body = json.dumps(payload, allow_nan=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self.reply(200, {'status': 'ok', 'model': 'Random Forest', 'endpoint': 'POST /api/predict'})

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= MAX_BODY:
                self.reply(413, {'error': 'Send a JSON body up to 8 KB.'})
                return
            data = json.loads(self.rfile.read(length))
            self.reply(200, predict(data))
        except (ValueError, UnicodeDecodeError, OverflowError) as exc:
            self.reply(400, {'error': str(exc)})
        except Exception:
            logging.exception('Prediction failed')
            self.reply(500, {'error': 'The model could not run. Check the deployment logs and retry.'})

    def do_OPTIONS(self):
        self.reply(405, {'error': 'Use GET or POST on the same origin.'})
