import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, CalendarDays, BookOpen, Calculator, ShoppingCart, Building2, Settings, Plus, Trash2, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

const KITCHENS = ['Kita Sonnenblume', 'Firmenkantine Leipzig'];
const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
const NAV = [
  ['Dashboard', LayoutDashboard], ['Speiseplanung', CalendarDays], ['Rezepte', BookOpen],
  ['Kalkulation', Calculator], ['Einkaufslisten', ShoppingCart], ['Küchen', Building2], ['Einstellungen', Settings]
];
const STORAGE_KEY = 'menueplaner-demo-v1';

function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function addDays(date, count) {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}
function displayDate(date) {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function loadPlans() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function App() {
  const [page, setPage] = useState('Speiseplanung');
  const [kitchen, setKitchen] = useState(KITCHENS[0]);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [plans, setPlans] = useState(loadPlans);
  const [saved, setSaved] = useState(true);
  const weekKey = isoDate(weekStart);
  const planKey = `${kitchen}::${weekKey}`;
  const rows = useMemo(() => Array.isArray(plans[planKey]) ? plans[planKey] : [], [plans, planKey]);
  const total = rows.reduce((sum, row) => sum + (Number(row.portions) || 0), 0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [plans]);

  function changeRows(update) {
    setPlans(prev => {
      const current = Array.isArray(prev[planKey]) ? prev[planKey] : [];
      return { ...prev, [planKey]: update(current) };
    });
  }
  function addMeal(day) {
    changeRows(current => [...current, { id: makeId(), day, name: '', portions: 0 }]);
  }
  function editMeal(id, field, value) {
    changeRows(current => current.map(row => row.id === id ? { ...row, [field]: value } : row));
  }
  function removeMeal(id) {
    if (window.confirm('Dieses Gericht wirklich entfernen?')) {
      changeRows(current => current.filter(row => row.id !== id));
    }
  }
  function moveWeek(delta) { setWeekStart(prev => addDays(prev, delta * 7)); }
  function printPlan() { window.print(); }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🍽️ MenüPlaner</h2>
        <p>Kita &amp; Business</p>
        <nav aria-label="Hauptnavigation">
          {NAV.map(([name, Icon]) => (
            <button key={name} className={page === name ? 'active' : ''} onClick={() => setPage(name)}>
              <Icon size={20} /> {name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <h1>{page}</h1>
          <label>
            <span className="sr-only">Küche auswählen</span>
            <select value={kitchen} onChange={e => setKitchen(e.target.value)}>
              {KITCHENS.map(name => <option key={name}>{name}</option>)}
            </select>
          </label>
        </header>

        <div className="welcome">
          <strong>Testversion – nur Beispieldaten und lokale Speicherung</strong>
          <p>Änderungen werden ausschließlich in diesem Browser auf diesem Gerät gespeichert. Noch keine Supabase-Verbindung und keine Benutzeranmeldung.</p>
        </div>

        {page === 'Dashboard' && (
          <>
            <section className="stats">
              <div className="card"><h3>Aktuelle Küche</h3><strong>{kitchen}</strong></div>
              <div className="card"><h3>Gerichte diese Woche</h3><strong>{rows.length}</strong></div>
              <div className="card"><h3>Geplante Portionen (Woche)</h3><strong>{total}</strong></div>
              <div className="card"><h3>Speicherung</h3><strong>{saved ? 'Lokal' : 'Fehler'}</strong></div>
            </section>
            <section className="meal-plan"><h2>Aktueller Wochenplan</h2><p>{displayDate(weekStart)} – {displayDate(addDays(weekStart, 4))}</p>
              <button className="primary" onClick={() => setPage('Speiseplanung')}>Speiseplan bearbeiten</button>
            </section>
          </>
        )}

        {page === 'Speiseplanung' && (
          <section className="meal-plan">
            <div className="plan-toolbar">
              <div><h2>Wochenspeiseplan</h2><p>{kitchen}</p></div>
              <div className="week-controls">
                <button onClick={() => moveWeek(-1)} aria-label="Vorherige Woche"><ChevronLeft size={20}/></button>
                <strong>{displayDate(weekStart)} – {displayDate(addDays(weekStart, 4))}</strong>
                <button onClick={() => moveWeek(1)} aria-label="Nächste Woche"><ChevronRight size={20}/></button>
                <button onClick={() => setWeekStart(mondayOf(new Date()))}>Diese Woche</button>
                <button className="primary" onClick={printPlan}><Printer size={17}/> Drucken</button>
              </div>
            </div>
            <p className="save-status" role="status">{saved ? '✓ Automatisch in diesem Browser gespeichert' : '⚠ Speichern fehlgeschlagen – Browserspeicher prüfen'}</p>
            <div className="table-scroll">
              <table className="planning-table">
                <thead><tr><th>Tag</th><th>Gericht</th><th>Portionen</th><th>Aktion</th></tr></thead>
                <tbody>
                  {DAYS.map((day, index) => {
                    const dayRows = rows.filter(row => row.day === day);
                    const dayTotal = dayRows.reduce((sum, row) => sum + (Number(row.portions) || 0), 0);
                    return (
                      <React.Fragment key={day}>
                        {dayRows.map((row, rowIndex) => (
                          <tr key={row.id}>
                            {rowIndex === 0 && <th scope="row" rowSpan={dayRows.length + 1} className="day-cell">{day}<small>{displayDate(addDays(weekStart, index))}</small></th>}
                            <td><input aria-label={`Gericht ${day}`} value={row.name} placeholder="Gericht eingeben" maxLength={150} onChange={e => editMeal(row.id, 'name', e.target.value)} /></td>
                            <td><input aria-label={`Portionen ${day}`} type="number" min="0" max="500" step="1" value={row.portions} onChange={e => {
                              const n = Number(e.target.value);
                              if (e.target.value === '' || (Number.isInteger(n) && n >= 0 && n <= 500)) editMeal(row.id, 'portions', e.target.value === '' ? '' : n);
                            }} /></td>
                            <td><button className="danger" aria-label="Gericht löschen" onClick={() => removeMeal(row.id)}><Trash2 size={18}/></button></td>
                          </tr>
                        ))}
                        <tr className="add-row">
                          {dayRows.length === 0 && <th scope="row" className="day-cell">{day}<small>{displayDate(addDays(weekStart, index))}</small></th>}
                          <td colSpan={3}><button onClick={() => addMeal(day)}><Plus size={17}/> Gericht hinzufügen</button><span className="day-total">Tagessumme: {dayTotal} Portionen</span>{dayTotal > 500 && <span className="warning">Über 500 Portionen!</span>}</td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="summary">Gesamt für diese Woche: <strong>{total} Portionen</strong> in {rows.length} Gerichten</p>
            <p className="footnote">Hinweis: Die Grenze von 500 Portionen gilt pro Tag. Die Planung zeigt bei Überschreitung eine Warnung. Die Daten sind nur auf diesem Gerät verfügbar.</p>
          </section>
        )}

        {!['Dashboard', 'Speiseplanung'].includes(page) && (
          <section className="meal-plan"><h2>{page}</h2><p>Dieser Bereich wird in einer späteren Version umgesetzt. Die Speiseplanung kannst du bereits ausprobieren.</p><button className="primary" onClick={() => setPage('Speiseplanung')}>Zur Speiseplanung</button></section>
        )}
      </main>
    </div>
  );
}
