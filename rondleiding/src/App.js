import { useMemo, useState } from 'react';
import './App.css';

const initialPoints = [
  {
    id: 'hoofdingang',
    name: 'hoofdingang',
    location: 'Hoofdgebouw',
    description:
      'Start bij de hoofdingang en voel direct de trots van studenten en docenten.',
    steps: [
      { instruction: 'loop 200 meter rechtdoor langs de balie', photoLabel: 'balie' },
      { instruction: 'ga rechtsaf richting de trap en ga één verdieping omhoog', photoLabel: 'trap' },
      { instruction: 'volg de blauwe route tot aan het atrium', photoLabel: 'atrium' },
    ],
  },
  {
    id: 'medialab',
    name: 'medialab',
    location: 'Bouwdeel B',
    description:
      'Het medialab is de plek waar creativiteit en technologie elkaar ontmoeten.',
    steps: [
      { instruction: 'ga vanaf het atrium links richting bouwdeel b', photoLabel: 'gang' },
      { instruction: 'loop door tot het glazen lokaal met de rode banner', photoLabel: 'lokaal' },
      { instruction: 'meld je bij de docent voor een korte uitleg', photoLabel: 'docent' },
    ],
  },
  {
    id: 'praktijkplein',
    name: 'praktijkplein',
    location: 'Begane grond',
    description:
      'Op het praktijkplein werken studenten samen aan echte opdrachten en cases.',
    steps: [
      { instruction: 'loop terug naar beneden via de trap', photoLabel: 'trap' },
      { instruction: 'ga rechtdoor tot het open plein met werktafels', photoLabel: 'plein' },
      { instruction: 'kies een team dat je wil volgen en sluit aan', photoLabel: 'team' },
    ],
  },
];

const createPointId = (name) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

function App() {
  const [activeView, setActiveView] = useState('tour');
  const [points, setPoints] = useState(initialPoints);
  const [activePointId, setActivePointId] = useState(initialPoints[0]?.id || '');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formValues, setFormValues] = useState({
    name: '',
    location: '',
    description: '',
    steps: '',
  });

  const activePoint = points.find((point) => point.id === activePointId) || points[0];
  const steps = activePoint?.steps || [];

  const mapPositions = useMemo(
    () =>
      points.map((point, index) => {
        const column = index % 3;
        const row = Math.floor(index / 3);
        return {
          id: point.id,
          x: 18 + column * 32,
          y: 22 + row * 28,
        };
      }),
    [points]
  );

  const handlePointSelect = (id) => {
    setActivePointId(id);
    setActiveStepIndex(0);
  };

  const handleStepChange = (direction) => {
    setActiveStepIndex((current) => {
      const next = current + direction;
      if (next < 0 || next >= steps.length) {
        return current;
      }
      return next;
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleAddPoint = (event) => {
    event.preventDefault();
    if (!formValues.name.trim() || !formValues.location.trim()) {
      return;
    }

    const parsedSteps = formValues.steps
      .split('\n')
      .map((step) => step.trim())
      .filter(Boolean)
      .map((instruction, index) => ({
        instruction,
        photoLabel: `stap ${index + 1}`,
      }));

    const newPoint = {
      id: createPointId(formValues.name),
      name: formValues.name.toLowerCase(),
      location: formValues.location,
      description: formValues.description || 'Nieuwe route toegevoegd door het team.',
      steps:
        parsedSteps.length > 0
          ? parsedSteps
          : [{ instruction: 'vul stapinformatie aan in het beheer', photoLabel: 'route' }],
    };

    setPoints((current) => [...current, newPoint]);
    setFormValues({ name: '', location: '', description: '', steps: '' });
  };

  return (
    <div className="app">
      <header className="site-header">
        <div className="logo" aria-label="roc van twente">
          <span className="logo-part logo-roc">roc</span>
          <span className="logo-part logo-van">van</span>
          <span className="logo-part logo-twente">twente</span>
        </div>
        <nav className="site-nav" aria-label="hoofdnavigatie">
          <button
            className={activeView === 'tour' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveView('tour')}
            type="button"
          >
            rondleiding
          </button>
          <button
            className={activeView === 'admin' ? 'nav-button active' : 'nav-button'}
            onClick={() => setActiveView('admin')}
            type="button"
          >
            admin
          </button>
        </nav>
      </header>

      <main>
        <section className="intro">
          <div className="intro-text">
            <p className="eyebrow">trots, persoonlijk en verbindend</p>
            <h1>rondleiding roc van twente</h1>
            <p className="lead">
              Ontdek de belangrijkste plekken op school via een interactieve route
              waar studenten, docenten en ouders samenkomen.
            </p>
          </div>
          <div className="intro-card">
            <div className="intro-photo">
              <div className="photo-overlay" />
              <span>diversiteit in beeld</span>
            </div>
            <div className="intro-meta">
              <p>navigatie op maat</p>
              <p>9 fotografieprincipes</p>
              <p>full-colour palet</p>
            </div>
          </div>
        </section>

        {activeView === 'tour' ? (
          <section className="tour-grid">
            <div className="panel map-panel">
              <div className="panel-header">
                <h2>kaart</h2>
                <span className="tag">{points.length} punten</span>
              </div>
              <div className="map">
                <div className="map-grid" />
                {mapPositions.map((position, index) => (
                  <button
                    key={position.id}
                    className={
                      position.id === activePoint?.id ? 'map-point active' : 'map-point'
                    }
                    style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    onClick={() => handlePointSelect(position.id)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="point-list">
                {points.map((point) => (
                  <button
                    key={point.id}
                    className={point.id === activePoint?.id ? 'point-card active' : 'point-card'}
                    onClick={() => handlePointSelect(point.id)}
                    type="button"
                  >
                    <span className="point-name">{point.name}</span>
                    <span className="point-location">{point.location}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel steps-panel">
              <div className="panel-header">
                <h2>route naar {activePoint?.name}</h2>
                <span className="tag">{steps.length} stappen</span>
              </div>
              <p className="point-description">{activePoint?.description}</p>
              <div className="step-card">
                <div className="step-photo">
                  <div className="photo-overlay" />
                  <span>{steps[activeStepIndex]?.photoLabel}</span>
                </div>
                <div className="step-content">
                  <p className="step-count">
                    stap {activeStepIndex + 1} van {steps.length}
                  </p>
                  <h3>{steps[activeStepIndex]?.instruction}</h3>
                  <div className="step-controls">
                    <button
                      type="button"
                      onClick={() => handleStepChange(-1)}
                      disabled={activeStepIndex === 0}
                    >
                      vorige
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepChange(1)}
                      disabled={activeStepIndex >= steps.length - 1}
                    >
                      volgende
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="admin-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>punten beheren</h2>
                <span className="tag">admin</span>
              </div>
              <form className="admin-form" onSubmit={handleAddPoint}>
                <label>
                  puntnaam
                  <input
                    name="name"
                    type="text"
                    value={formValues.name}
                    onChange={handleFormChange}
                    placeholder="bijv. vavo studieruimte"
                    required
                  />
                </label>
                <label>
                  locatie
                  <input
                    name="location"
                    type="text"
                    value={formValues.location}
                    onChange={handleFormChange}
                    placeholder="bijv. gebouw c"
                    required
                  />
                </label>
                <label>
                  beschrijving
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleFormChange}
                    placeholder="korte intro voor de kaart en route"
                    rows="3"
                  />
                </label>
                <label>
                  stappen (één per regel)
                  <textarea
                    name="steps"
                    value={formValues.steps}
                    onChange={handleFormChange}
                    placeholder="loop 50 meter rechtdoor&#10;ga links de trap op"
                    rows="4"
                  />
                </label>
                <button type="submit" className="primary">
                  punt toevoegen
                </button>
              </form>
            </div>
            <div className="panel">
              <div className="panel-header">
                <h2>overzicht</h2>
                <span className="tag">{points.length} punten</span>
              </div>
              <ul className="admin-list">
                {points.map((point) => (
                  <li key={point.id}>
                    <div>
                      <p className="point-name">{point.name}</p>
                      <p className="point-location">{point.location}</p>
                    </div>
                    <span>{point.steps.length} stappen</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>voor iedereen · nieuwsgierig · inspirerend</p>
      </footer>
    </div>
  );
}

export default App;
