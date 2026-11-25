"""Run from repository root: python -m unittest discover -s tests -v"""
import gzip
import hashlib
import json
import unittest
from api.predict import MODEL_DIR, FEATURES, feature_rows, predict, load_model

EXAMPLE = {'date':'2012-07-15','hour':17,'weather':1,'temp':24,'atemp':26,'humidity':65,'windspeed':12}

class PredictionTests(unittest.TestCase):
    def test_model_integrity(self):
        metadata = json.loads((MODEL_DIR/'metadata.json').read_text())
        with gzip.open(MODEL_DIR/'random_forest.pkl.gz','rb') as f:
            digest = hashlib.file_digest(f,'sha256').hexdigest()
        self.assertEqual(digest, metadata['sha256_uncompressed'])
        self.assertEqual(load_model().n_estimators, 100)
        self.assertEqual(list(load_model().feature_names_in_), FEATURES)

    def test_schema(self):
        hour, context, frame = feature_rows(EXAMPLE)
        self.assertEqual(hour,17)
        self.assertEqual(list(frame.columns), FEATURES)
        self.assertEqual(len(frame),24)
        self.assertEqual(list(frame['hr']),list(range(24)))
        self.assertEqual(context['weekday'],0)
        self.assertEqual(context['workingday'],0)
        self.assertEqual(float(frame.iloc[17]['temp']),24.0)

    def test_prediction(self):
        result = predict(EXAMPLE)
        self.assertEqual(len(result['hourly']),24)
        self.assertEqual(result['predicted_count'],result['hourly'][17]['count'])
        self.assertGreater(result['predicted_count'],0)
        self.assertTrue(all(row['count'] >= 0 for row in result['hourly']))

    def test_reference_cases(self):
        cases = json.loads((MODEL_DIR.parent/'tests'/'reference_cases.json').read_text())
        for case in cases:
            with self.subTest(payload=case['input']):
                self.assertAlmostEqual(predict(case['input'])['predicted_count'], case['expected'], places=8)

    def test_invalid_input(self):
        for name, val in [('date','2026-11-25'),('hour',24),('weather',5),('humidity',101),('temp',True),('windspeed',float('nan'))]:
            with self.subTest(name=name), self.assertRaises(ValueError):
                predict({**EXAMPLE,name:val})
        with self.assertRaises(ValueError): predict([])

if __name__ == '__main__': unittest.main()
