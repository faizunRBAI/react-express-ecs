import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function App() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/health`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>react-express-ecs</h1>
        <p className="subtitle">React + Express + PostgreSQL on AWS ECS</p>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>API Health</h2>
          {loading && <p className="status loading">Checking…</p>}
          {error && <p className="status error">⚠ {error}</p>}
          {health && (
            <dl className="health-list">
              <dt>Status</dt>
              <dd className={`badge badge--${health.status}`}>{health.status}</dd>
              <dt>Database</dt>
              <dd className={`badge badge--${health.checks?.database === 'ok' ? 'ok' : 'error'}`}>
                {health.checks?.database}
              </dd>
              <dt>Uptime</dt>
              <dd>{Math.floor(health.uptime)}s</dd>
              <dt>Timestamp</dt>
              <dd>{new Date(health.timestamp).toLocaleString()}</dd>
            </dl>
          )}
        </section>

        <section className="card">
          <h2>Stack</h2>
          <ul className="stack-list">
            <li>⚛ React 18 + Vite (S3 + CloudFront)</li>
            <li>🟢 Node.js + Express (ECS Fargate)</li>
            <li>🐘 PostgreSQL 15 (RDS db.t3.micro)</li>
            <li>☁ AWS us-east-1</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
