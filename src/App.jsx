import { useEffect, useMemo, useState } from 'react';

import Header from './components/Header/Header';
import FactorsForm from './components/FactorsForm/FactorsForm';
import CCDControls from './components/CCDControls/CCDControls';
import CCDTable from './components/CCDTable/CCDTable';

import RegressionResults from './components/RegressionResults/RegressionResults';
import ResponseSurface3D from './components/ResponseSurface3D/ResponseSurface3D';
import ResponseContour2D from './components/ResponseContour2D/ResponseContour2D';

import StudentTestTable from './components/StudentTestTable/StudentTestTable';
import FisherTestPanel from './components/FisherTestPanel/FisherTestPanel';
import DiagnosticsTable from './components/DiagnosticsTable/DiagnosticsTable';
import CorrelationPanel from './components/CorrelationPanel/CorrelationPanel';

import ProjectGate from './components/ProjectGate/ProjectGate';

import { generateCCD2FactorsRotatable } from './utils/ccd';
import { exportCCDToCSV } from './utils/csv';
import { quadraticRegression2Factors } from './utils/regression';
import { correlation2Factors } from './utils/correlation';

import {
  studentTest2Factors,
  fisherConcordance2Factors,
  buildDiagnosticsTable2Factors,
} from './utils/statsTests';

import {
  listProjects,
  createProject,
  loadProject,
  saveProject,
  deleteProject,
} from './utils/storage';

function isValidNumber(v) {
  const n = Number(v);
  return Number.isFinite(n);
}

function makeKey(i) {
  return `y${i + 1}`;
}

function App() {
  // ✅ proiect (local storage)
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [projectsIndex, setProjectsIndex] = useState(() => listProjects());

  // factori

  const [x1Min, setX1Min] = useState('');
  const [x1Max, setX1Max] = useState('');
  const [x2Min, setX2Min] = useState('');
  const [x2Max, setX2Max] = useState('');

  // răspunsuri dinamice
  const [responseDefs, setResponseDefs] = useState([
    { key: 'y1', label: 'Variabila 1' },
    { key: 'y2', label: 'Variabila 2' },
  ]);
  const [activeResponseKey, setActiveResponseKey] = useState('y1');

  const [centerPoints, setCenterPoints] = useState(5);
  const [ccdRuns, setCcdRuns] = useState([]);

  // analiză
  const [models, setModels] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);

  function resetAnalysis() {
    setModels(null);
    setAnalyzed(false);
  }

  // ======= DERIVED (safe even dacă nu există proiect) =======
  const responseKeys = useMemo(
    () => responseDefs.map((r) => r.key),
    [responseDefs],
  );

  const filledCounts = useMemo(() => {
    const counts = {};
    for (const k of responseKeys) counts[k] = 0;

    for (const run of ccdRuns) {
      for (const k of responseKeys) {
        if (isValidNumber(run.responses?.[k])) counts[k] += 1;
      }
    }
    return counts;
  }, [ccdRuns, responseKeys]);

  const canAnalyze = useMemo(() => {
    if (ccdRuns.length === 0) return false;
    return responseKeys.every((k) => (filledCounts[k] ?? 0) >= 6);
  }, [ccdRuns.length, responseKeys, filledCounts]);

  const canGenerate =
    x1Min !== '' &&
    x1Max !== '' &&
    x2Min !== '' &&
    x2Max !== '' &&
    Number(centerPoints) >= 1 &&
    Number(x1Min) < Number(x1Max) &&
    Number(x2Min) < Number(x2Max);

  const activeModel = models?.[activeResponseKey] ?? null;
  const activeLabel =
    responseDefs.find((r) => r.key === activeResponseKey)?.label ??
    activeResponseKey;

  const correlationResult = useMemo(() => {
    if (!analyzed || !activeModel) return null;
    return correlation2Factors({
      runs: ccdRuns,
      responseKey: activeResponseKey,
      model: activeModel,
    });
  }, [analyzed, activeModel, ccdRuns, activeResponseKey]);

  const studentResult = useMemo(() => {
    if (!analyzed || !activeModel) return null;
    return studentTest2Factors({
      runs: ccdRuns,
      responseKey: activeResponseKey,
      model: activeModel,
      alpha: 0.05,
    });
  }, [analyzed, activeModel, ccdRuns, activeResponseKey]);

  const fisherResult = useMemo(() => {
    if (!analyzed || !activeModel) return null;
    return fisherConcordance2Factors({
      runs: ccdRuns,
      responseKey: activeResponseKey,
      model: activeModel,
      alpha: 0.05,
    });
  }, [analyzed, activeModel, ccdRuns, activeResponseKey]);

  const diagTable = useMemo(() => {
    if (!analyzed || !activeModel) return null;
    return buildDiagnosticsTable2Factors({
      runs: ccdRuns,
      responseKey: activeResponseKey,
      model: activeModel,
    });
  }, [analyzed, activeModel, ccdRuns, activeResponseKey]);

  // ======= AUTOSAVE (doar dacă există proiect) =======
  useEffect(() => {
    if (!projectId) return;

    const payload = {
      id: projectId,
      name: projectName,
      x1Min,
      x1Max,
      x2Min,
      x2Max,
      centerPoints,
      responseDefs,
      activeResponseKey,
      ccdRuns,
    };

    const t = setTimeout(() => {
      saveProject(projectId, payload);
      setProjectsIndex(listProjects());
    }, 400);

    return () => clearTimeout(t);
  }, [
    projectId,
    projectName,
    x1Min,
    x1Max,
    x2Min,
    x2Max,
    centerPoints,
    responseDefs,
    activeResponseKey,
    ccdRuns,
  ]);

  // ======= ACTIONS: proiect =======
  function handleCreateProject(name) {
    const p = createProject(name);

    setProjectsIndex(listProjects());
    setProjectId(p.id);
    setProjectName(p.name);

    // reset state (proiect nou)
    setX1Min('');
    setX1Max('');
    setX2Min('');
    setX2Max('');
    setCenterPoints(5);

    setResponseDefs([
      { key: 'y1', label: 'Variabila 1' },
      { key: 'y2', label: 'Variabila 2' },
    ]);
    setActiveResponseKey('y1');
    setCcdRuns([]);

    resetAnalysis();
  }

  function handleOpenProject(id) {
    const data = loadProject(id);
    if (!data) return;

    setProjectId(id);
    setProjectName(data.name ?? '');

    setX1Min(data.x1Min ?? '');
    setX1Max(data.x1Max ?? '');
    setX2Min(data.x2Min ?? '');
    setX2Max(data.x2Max ?? '');
    setCenterPoints(data.centerPoints ?? 5);

    setResponseDefs(
      data.responseDefs ?? [
        { key: 'y1', label: 'Variabila 1' },
        { key: 'y2', label: 'Variabila 2' },
      ],
    );

    setActiveResponseKey(data.activeResponseKey ?? 'y1');
    setCcdRuns(data.ccdRuns ?? []);

    resetAnalysis();
  }

  // ======= ACTIONS: app =======

  function handleGenerateCCD() {
    const runs = generateCCD2FactorsRotatable({
      x1Min: Number(x1Min),
      x1Max: Number(x1Max),
      x2Min: Number(x2Min),
      x2Max: Number(x2Max),
      centerPoints: Number(centerPoints),
      responseKeys,
    });

    setCcdRuns(runs);
    resetAnalysis();
  }

  function handleChangeY(runNumber, responseKey, value) {
    setCcdRuns((prev) =>
      prev.map((r) =>
        r.run === runNumber
          ? { ...r, responses: { ...r.responses, [responseKey]: value } }
          : r,
      ),
    );
    resetAnalysis();
  }

  function handleAnalyze() {
    const nextModels = {};
    for (const rDef of responseDefs) {
      nextModels[rDef.key] = quadraticRegression2Factors(
        ccdRuns,
        rDef.key,
      );
    }
    setModels(nextModels);
    setAnalyzed(Boolean(nextModels[activeResponseKey]));
  }

  function addResponse() {
    const nextIndex = responseDefs.length;
    const key = makeKey(nextIndex);
    const label = `Răspuns ${nextIndex + 1}`;

    const nextDefs = [...responseDefs, { key, label }];
    setResponseDefs(nextDefs);

    setCcdRuns((prev) =>
      prev.map((r) => ({
        ...r,
        responses: { ...r.responses, [key]: '' },
      })),
    );

    setActiveResponseKey(key);
    resetAnalysis();
  }

  function renameResponse(key, label) {
    setResponseDefs((prev) =>
      prev.map((r) => (r.key === key ? { ...r, label } : r)),
    );
  }

  function removeResponse(key) {
    if (responseDefs.length <= 1) return;

    const nextDefs = responseDefs.filter((r) => r.key !== key);
    setResponseDefs(nextDefs);

    setCcdRuns((prev) =>
      prev.map((r) => {
        const next = { ...r.responses };
        delete next[key];
        return { ...r, responses: next };
      }),
    );

    if (activeResponseKey === key) setActiveResponseKey(nextDefs[0].key);
    resetAnalysis();
  }

  // ======= RENDER: gate sau app =======
  if (!projectId) {
    return (
      <ProjectGate
        projects={projectsIndex}
        onCreate={handleCreateProject}
        onOpen={handleOpenProject}
        onDelete={(id) => {
          deleteProject(id);
          setProjectsIndex(listProjects());
        }}
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Header />

      {/* info proiect */}
      <div
        style={{
          marginTop: 10,
          background: 'white',
          padding: 14,
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <strong>Proiect:</strong> {projectName}
        </div>
        <button onClick={() => setProjectId(null)}>Schimbă proiect</button>
      </div>

      {/* Manager răspunsuri */}
      <div
        style={{
          marginTop: 10,
          background: 'white',
          padding: 20,
          borderRadius: 8,
        }}
      >
        <h2>Variabile dependente (Y)</h2>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <label>
            Răspuns activ:{' '}
            <select
              value={activeResponseKey}
              onChange={(e) => setActiveResponseKey(e.target.value)}
            >
              {responseDefs.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label} ({r.key})
                </option>
              ))}
            </select>
          </label>

          <button onClick={addResponse}>+ Adaugă răspuns</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {responseDefs.map((r) => (
            <div
              key={r.key}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ width: 50 }}>{r.key}</span>
              <input
                type='text'
                value={r.label}
                onChange={(e) => renameResponse(r.key, e.target.value)}
                style={{ flex: 1, minWidth: 220 }}
              />
              <button
                onClick={() => removeResponse(r.key)}
                disabled={responseDefs.length <= 1}
              >
                Șterge
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Factori */}
      <FactorsForm
        x1Min={x1Min}
        x1Max={x1Max}
        setX1Min={setX1Min}
        setX1Max={setX1Max}
        x2Min={x2Min}
        x2Max={x2Max}
        setX2Min={setX2Min}
        setX2Max={setX2Max}
      />

      {/* CCD controls */}
      <CCDControls
        centerPoints={centerPoints}
        setCenterPoints={setCenterPoints}
        canGenerate={canGenerate}
        onGenerate={handleGenerateCCD}
        totalRuns={ccdRuns.length}
        onExportCSV={() => exportCCDToCSV(ccdRuns)}
      />

      {/* Tabel */}
      {ccdRuns.length > 0 && (
        <CCDTable
          runs={ccdRuns}
          responseDefs={responseDefs}
          onChangeY={handleChangeY}
        />
      )}

      {/* Analiză */}
      {ccdRuns.length > 0 && (
        <div
          style={{
            marginTop: 20,
            background: 'white',
            padding: 20,
            borderRadius: 8,
          }}
        >
          <h2>Analiză</h2>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {responseDefs.map((r) => (
              <p key={r.key} style={{ margin: 0 }}>
                {r.label} ({r.key}): <strong>{filledCounts[r.key] ?? 0}</strong>{' '}
                / {ccdRuns.length}
              </p>
            ))}
          </div>

          <button
            style={{ marginTop: 12 }}
            onClick={handleAnalyze}
            disabled={!canAnalyze}
          >
            Analizează modelul
          </button>

          {!canAnalyze && (
            <p style={{ color: '#b45309', marginTop: 10 }}>
              Pentru analiză: minim 6 valori numerice pentru fiecare răspuns
              (Y).
            </p>
          )}
        </div>
      )}

      {/* Rezultate doar pentru răspunsul activ */}
      {analyzed && activeModel && (
        <>
          <RegressionResults
            title={`Model quadratic – ${activeLabel} (${activeResponseKey})`}
            model={activeModel}
          />

          <StudentTestTable
            title={`Testul Student (cu p-value) – ${activeLabel} (${activeResponseKey})`}
            result={studentResult}
          />

          <FisherTestPanel
            title={`Test Fischer–Snedecor (concordanță) – ${activeLabel} (${activeResponseKey})`}
            result={fisherResult}
          />

          <DiagnosticsTable
            title={`Tabel Ymăs/Ycalc – ${activeLabel} (${activeResponseKey})`}
            data={diagTable}
          />

          <CorrelationPanel
            title={`Coeficient de corelație – ${activeLabel} (${activeResponseKey})`}
            result={correlationResult}
          />

          <ResponseSurface3D
            title={`Suprafață 3D – ${activeLabel} (${activeResponseKey})`}
            model={activeModel}
          />

          <ResponseContour2D
            title={`Reprezentare 2D (contur) – ${activeLabel} (${activeResponseKey})`}
            model={activeModel}
          />
        </>
      )}
    </div>
  );
}

export default App;
