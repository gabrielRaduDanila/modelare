export function exportCCDToCSV(runs, filename = 'ccd_runs.csv') {
  if (!runs?.length) return;

  const headers = [
    'run',
    'type',
    'replicateIndex',
    'x1_coded',
    'x2_coded',
    'x1_real',
    'x2_real',
    'y1',
    'y2',
  ];

  const escape = (v) => {
    const s = String(v ?? '');
    if (/[,"\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const rows = runs.map((r) => [
    r.run,
    r.type,
    r.replicateIndex ?? '',
    r.x1_coded,
    r.x2_coded,
    r.x1_real,
    r.x2_real,
    r.y1 ?? '',
    r.y2 ?? '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
