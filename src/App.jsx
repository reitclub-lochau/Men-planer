import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Calculator,
  ShoppingCart,
  Building2,
  Settings,
  Plus,
  Trash2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Check
} from 'lucide-react';

const DAYS = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag'
];

const MEAL_TYPES = ['Mittagessen', 'Dessert', 'Vesper'];

const MEAL_ICONS = {
  Mittagessen: '🍽️',
  Dessert: '🍮',
  Vesper: '🍎'
};

const NAV = [
  ['Dashboard', LayoutDashboard],
  ['Speiseplanung', CalendarDays],
  ['Rezepte', BookOpen],
  ['Hauptspeisepläne', BookOpen],
  ['Kalkulation', Calculator],
  ['Einkaufslisten', ShoppingCart],
  ['Küchen', Building2],
  ['Einstellungen', Settings]
];

const STORAGE_KEY = 'menueplaner-demo-v1';
const KITCHENS_KEY = 'menueplaner-kitchens-v1';
const TEMPLATES_KEY = 'menueplaner-templates-v1';
const TEMPLATE_PLANS_KEY = 'menueplaner-template-plans-v1';
const DEFAULT_KITCHENS = [
  {
    id: 'kita-sonnenblume',
    name: 'Kita Sonnenblume',
    participants: 200,
    meals: [...MEAL_TYPES]
  },
  {
    id: 'firmenkantine-leipzig',
    name: 'Firmenkantine Leipzig',
    participants: 150,
    meals: [...MEAL_TYPES]
  }
];

function mondayOf(date) {
  const d = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
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
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadPlans() {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '{}'
    );
    return value &&
      typeof value === 'object' &&
      !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
}

function loadKitchens() {
  try {
    const stored = localStorage.getItem(KITCHENS_KEY);
    if (!stored) return DEFAULT_KITCHENS;

    const value = JSON.parse(stored);
    if (!Array.isArray(value) || value.length === 0) {
      return DEFAULT_KITCHENS;
    }

    return value;
  } catch {
    return DEFAULT_KITCHENS;
  }
}
function loadTemplates() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(TEMPLATES_KEY) || '[]'
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function loadTemplatePlans() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(TEMPLATE_PLANS_KEY) || '{}'
    );

    return saved &&
      typeof saved === 'object' &&
      !Array.isArray(saved)
      ? saved
      : {};
  } catch {
    return {};
  }
}
const EMPTY_FORM = {
  name: '',
  participants: 0,
  meals: [...MEAL_TYPES],
  copyFrom: ''
};

export default function App() {
  const [page, setPage] = useState('Speiseplanung');
  const [kitchens, setKitchens] = useState(loadKitchens);
  const [kitchenId, setKitchenId] = useState(
    () => loadKitchens()[0].id
  );
  const [weekStart, setWeekStart] = useState(
    () => mondayOf(new Date())
  );
  const [plans, setPlans] = useState(loadPlans);
  const [saved, setSaved] = useState(true);
  const [editingIds, setEditingIds] = useState([]);
const [templates, setTemplates] = useState(loadTemplates);

const [templatePlans, setTemplatePlans] = useState(
  loadTemplatePlans
);

const [templateId, setTemplateId] = useState('');
const [templateWeek, setTemplateWeek] = useState(1);
const [showDistribution, setShowDistribution] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [recipeName, setRecipeName] = useState('');
const [recipeCategory, setRecipeCategory] = useState('Hauptgericht');
const [recipePortions, setRecipePortions] = useState(10);
  const [recipeIngredients, setRecipeIngredients] = useState([
  { name: '', quantity: '', unit: 'g' }
]);
  const saveRecipe = () => {
  const name = recipeName.trim();

  if (!name) {
    alert('Bitte einen Rezeptnamen eingeben.');
    return;
  }

  if (!Number.isInteger(recipePortions) || recipePortions < 1) {
    alert('Bitte eine gültige Portionsanzahl eingeben.');
    return;
  }

  const newRecipe = {
    id: crypto.randomUUID(),
    name,
    category: recipeCategory,
    portions: recipePortions
  };

  setRecipes((previous) => [...previous, newRecipe]);

  setRecipeName('');
  setRecipeCategory('Hauptgericht');
  setRecipePortions(10);
  setShowRecipeForm(false);
};
  const [recipes, setRecipes] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('menuplaner_recipes')) || [];
  } catch {
    return [];
  }
});
  useEffect(() => {
  localStorage.setItem(
    'menuplaner_recipes',
    JSON.stringify(recipes)
  );
}, [recipes]);
const [targetKitchenIds, setTargetKitchenIds] = useState([]);
  const [distributionAction, setDistributionAction] = useState('replace');
const [distributionMode, setDistributionMode] = useState('single');

const [distributionStart, setDistributionStart] = useState('');
const [selectedDays, setSelectedDays] = useState([...DAYS]);
  const [showKitchenForm, setShowKitchenForm] = useState(false);
  const [editingKitchenId, setEditingKitchenId] = useState(null);
  const [kitchenForm, setKitchenForm] = useState(EMPTY_FORM);

  const currentKitchen =
    kitchens.find(item => item.id === kitchenId) ||
    kitchens[0];

  const weekKey = isoDate(weekStart);
  const planKey = `${currentKitchen.name}::${weekKey}`;

  const rows = useMemo(
    () => Array.isArray(plans[planKey])
      ? plans[planKey]
      : [],
    [plans, planKey]
  );

  const total = rows.reduce(
    (sum, row) => sum + (Number(row.portions) || 0),
    0
  );

  const totalsByType = MEAL_TYPES.reduce((result, type) => {
    result[type] = rows
      .filter(row => (row.type || 'Mittagessen') === type)
      .reduce(
        (sum, row) => sum + (Number(row.portions) || 0),
        0
      );
    return result;
  }, {});

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(plans)
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [plans]);

  useEffect(() => {
    try {
      localStorage.setItem(
        KITCHENS_KEY,
        JSON.stringify(kitchens)
      );
    } catch {
      setSaved(false);
    }
  }, [kitchens]);
useEffect(() => {
  try {
    localStorage.setItem(
      TEMPLATES_KEY,
      JSON.stringify(templates)
    );

    localStorage.setItem(
      TEMPLATE_PLANS_KEY,
      JSON.stringify(templatePlans)
    );
  } catch (error) {
    console.error(
      'Fehler beim Speichern der Hauptspeisepläne:',
      error
    );
  }
}, [templates, templatePlans]);
  function changeRows(update) {
    setPlans(prev => {
      const current = Array.isArray(prev[planKey])
        ? prev[planKey]
        : [];

      return {
        ...prev,
        [planKey]: update(current)
      };
    });
  }

  function addMeal(day, type) {
    const id = makeId();

    changeRows(current => [
      ...current,
      {
        id,
        day,
        type,
        name: '',
        portions: 0
      }
    ]);

    setEditingIds(prev => [...prev, id]);
  }

  function editMeal(id, field, value) {
    changeRows(current =>
      current.map(row =>
        row.id === id
          ? { ...row, [field]: value }
          : row
      )
    );
  }

  function removeMeal(id) {
    if (window.confirm('Dieses Gericht wirklich entfernen?')) {
      changeRows(current =>
        current.filter(row => row.id !== id)
      );

      setEditingIds(prev =>
        prev.filter(item => item !== id)
      );
    }
  }

  function toggleEditing(id) {
    setEditingIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }

  function moveWeek(delta) {
    setWeekStart(prev => addDays(prev, delta * 7));
    setEditingIds([]);
  }
function createTemplate() {
  const name = window.prompt(
    'Wie soll der Hauptspeiseplan heißen?',
    'Kita-Speiseplan'
  );

  if (name === null) return;

  const trimmed = name.trim();

  if (!trimmed) {
    alert('Bitte einen Namen eingeben.');
    return;
  }

  if (
    templates.some(
      item =>
        item.name.toLowerCase() === trimmed.toLowerCase()
    )
  ) {
    alert('Dieser Hauptspeiseplan existiert bereits.');
    return;
  }

  const id = makeId();

  setTemplates(prev => [
    ...prev,
    {
      id,
      name: trimmed
    }
  ]);

  setTemplateId(id);
  setPage('Hauptspeisepläne');
}

function addTemplateMeal(day, type) {
  if (!templateId) return;

  const id = makeId();

  setTemplatePlans(prev => ({
    ...prev,
    [`${templateId}::${templateWeek}`]: [
      ...(prev[`${templateId}::${templateWeek}`] || []),
      {
        id,
        day,
        type,
        name: '',
        portions: 0
      }
    ]
  }));
}
function editTemplateMeal(id, field, value) {
  if (!templateId) return;

  setTemplatePlans(prev => ({
    ...prev,
    [`${templateId}::${templateWeek}`]: (prev[`${templateId}::${templateWeek}`] || []).map(row =>
      row.id === id
        ? { ...row, [field]: value }
        : row
    )
  }));
} 
  function openNewKitchen() {
    setEditingKitchenId(null);
    setKitchenForm({
      ...EMPTY_FORM,
      meals: [...MEAL_TYPES]
    });
    setShowKitchenForm(true);
  }

  function openEditKitchen(item) {
    setEditingKitchenId(item.id);

    setKitchenForm({
      name: item.name,
      participants: item.participants,
      meals: [...item.meals],
      copyFrom: ''
    });

    setShowKitchenForm(true);
  }

  function toggleKitchenMeal(type) {
    setKitchenForm(prev => ({
      ...prev,
      meals: prev.meals.includes(type)
        ? prev.meals.filter(item => item !== type)
        : [...prev.meals, type]
    }));
  }

  function saveKitchen(event) {
    event.preventDefault();

    const name = kitchenForm.name.trim();
    const participants = Number(kitchenForm.participants);

    if (!name) {
      alert('Bitte einen Küchennamen eingeben.');
      return;
    }

    if (
      !Number.isInteger(participants) ||
      participants < 0 ||
      participants > 10000
    ) {
      alert('Bitte eine gültige Teilnehmerzahl eingeben.');
      return;
    }

    if (kitchenForm.meals.length === 0) {
      alert('Bitte mindestens eine Mahlzeit auswählen.');
      return;
    }

    const duplicate = kitchens.some(
      item =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== editingKitchenId
    );

    if (duplicate) {
      alert('Eine Küche mit diesem Namen existiert bereits.');
      return;
    }

    if (editingKitchenId) {
      const oldKitchen = kitchens.find(
        item => item.id === editingKitchenId
      );

      if (oldKitchen && oldKitchen.name !== name) {
        setPlans(prev => {
          const updated = { ...prev };
          const prefix = `${oldKitchen.name}::`;

          Object.keys(prev).forEach(key => {
            if (key.startsWith(prefix)) {
              const newKey =
                `${name}::${key.slice(prefix.length)}`;

              updated[newKey] = prev[key];
              delete updated[key];
            }
          });

          return updated;
        });
      }

      setKitchens(prev =>
        prev.map(item =>
          item.id === editingKitchenId
            ? {
                ...item,
                name,
                participants,
                meals: kitchenForm.meals
              }
            : item
        )
      );
    } else {
      const id = makeId();

      const newKitchen = {
        id,
        name,
        participants,
        meals: kitchenForm.meals
      };

      if (kitchenForm.copyFrom) {
        const sourceKitchen = kitchens.find(
          item => item.id === kitchenForm.copyFrom
        );

        if (sourceKitchen) {
          const sourceKey =
            `${sourceKitchen.name}::${weekKey}`;

          const sourceRows = Array.isArray(plans[sourceKey])
            ? plans[sourceKey]
            : [];

          const copiedRows = sourceRows
            .filter(row =>
              kitchenForm.meals.includes(
                row.type || 'Mittagessen'
              )
            )
            .map(row => ({
              ...row,
              id: makeId(),
              portions: 0
            }));

          setPlans(prev => ({
            ...prev,
            [`${name}::${weekKey}`]: copiedRows
          }));
        }
      }

      setKitchens(prev => [...prev, newKitchen]);
      setKitchenId(id);
    }

    setShowKitchenForm(false);
    setEditingKitchenId(null);
    setEditingIds([]);
  }

  function deleteKitchen(item) {
    if (kitchens.length <= 1) {
      alert('Mindestens eine Küche muss vorhanden bleiben.');
      return;
    }

    const confirmed = window.confirm(
      `Küche "${item.name}" wirklich löschen?\n\n` +
      'Auch alle gespeicherten Speisepläne dieser Küche werden gelöscht.'
    );

    if (!confirmed) return;

    const prefix = `${item.name}::`;

    setPlans(prev => {
      const updated = { ...prev };

      Object.keys(updated).forEach(key => {
        if (key.startsWith(prefix)) {
          delete updated[key];
        }
      });

      return updated;
    });

    const remaining = kitchens.filter(
      kitchen => kitchen.id !== item.id
    );

    setKitchens(remaining);

    if (kitchenId === item.id) {
      setKitchenId(remaining[0].id);
    }

    setEditingIds([]);
  }
function distributeTemplate() {
  if (!templateId) {
    alert('Bitte zuerst einen Hauptspeiseplan auswählen.');
    return;
  }

  const sourceRows = templatePlans[`${templateId}::${templateWeek}`] || [];

  if (sourceRows.length === 0) {
    alert('Der Hauptspeiseplan enthält noch keine Gerichte.');
    return;
  }

  if (targetKitchenIds.length === 0) {
    alert('Bitte mindestens eine Küche auswählen.');
    return;
  }

  const confirmed = window.confirm(
  `Speiseplan auf die ausgewählten Küchen übertragen?\n\n` +
  (distributionAction === 'replace'
    ? 'Vorhandene Gerichte werden ersetzt.'
    : 'Neue Gerichte werden zu vorhandenen Gerichten hinzugefügt.')
);

  if (!confirmed) return;

  setPlans(prev => {
    const updated = { ...prev };

    targetKitchenIds.forEach(id => {
      const kitchen = kitchens.find(item => item.id === id);
      if (!kitchen) return;

      const key = `${kitchen.name}::${weekKey}`;

    const newRows = sourceRows
  .filter(row =>
    kitchen.meals.includes(row.type || 'Mittagessen')
  )
  .map(row => ({
    ...row,
    id: makeId(),
    portions: 0
  }));

updated[key] = distributionAction === 'replace'
  ? newRows
  : [...(updated[key] || []), ...newRows];
    });

    return updated;
  });

  setShowDistribution(false);
  setTargetKitchenIds([]);

  alert('Hauptspeiseplan erfolgreich verteilt!');
}
  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
<button
  className="menu-close"
  onClick={() => setMenuOpen(false)}
  aria-label="Menü schließen"
>
  ✕
</button>
        <img
  src="/lieblingskueche-logo.jpg"
  alt="Lieblingsküche"
  style={{
    width: '160px',
    height: 'auto',
    display: 'block',
    margin: '0 auto 15px'
  }}
/>
        <p>Kita &amp; Business</p>

        <nav aria-label="Hauptnavigation">
          {NAV.map(([name, Icon]) => (
            <button
              key={name}
              className={page === name ? 'active' : ''}
              onClick={() => {
  setPage(name);
  setMenuOpen(false);
}}
            >
              <Icon size={20} />
              {name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
<button
  className="menu-toggle"
  onClick={() => setMenuOpen(!menuOpen)}
>
  ☰ Menü
</button>    
        <header className="header">
          <h1>{page}</h1>

          <label>
            <span className="sr-only">
              Küche auswählen
            </span>

            <select
              value={currentKitchen.id}
              onChange={e => {
                setKitchenId(e.target.value);
                setEditingIds([]);
              }}
            >
              {kitchens.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="welcome">
          <strong>Lieblingsküche – Menüplanung</strong>
          <p>
            Alle Daten werden automatisch in diesem Browser
            gespeichert. Eine zentrale Speicherung folgt später.
          </p>
        </div>

        {page === 'Dashboard' && (
          <>
            <section className="stats">
              <div className="card">
                <h3>Aktuelle Küche</h3>
                <strong>{currentKitchen.name}</strong>
              </div>

              <div className="card">
                <h3>Gerichte diese Woche</h3>
                <strong>{rows.length}</strong>
              </div>

              {MEAL_TYPES.map(type => (
                <div className="card" key={type}>
                  <h3>{type} – Portionen</h3>
                  <strong>{totalsByType[type]}</strong>
                </div>
              ))}

              <div className="card">
                <h3>Gesamtportionen</h3>
                <strong>{total}</strong>
              </div>

              <div className="card">
                <h3>Anzahl Küchen</h3>
                <strong>{kitchens.length}</strong>
              </div>

              <div className="card">
                <h3>Speicherung</h3>
                <strong>{saved ? 'Lokal' : 'Fehler'}</strong>
              </div>
            </section>

            <section className="meal-plan">
              <h2>Aktueller Wochenplan</h2>
              <p>
                {displayDate(weekStart)} –{' '}
                {displayDate(addDays(weekStart, 4))}
              </p>

              <button
                className="primary"
                onClick={() => setPage('Speiseplanung')}
              >
                Speiseplan bearbeiten
              </button>
            </section>
          </>
        )}

        {page === 'Speiseplanung' && (
          <section className="meal-plan">
            <div className="plan-toolbar">
              <div>
                <h2>Wochenspeiseplan</h2>
                <p>{currentKitchen.name}</p>
              </div>

              <div className="week-controls">
                <button
                  onClick={() => moveWeek(-1)}
                  aria-label="Vorherige Woche"
                >
                  <ChevronLeft size={20} />
                </button>

                <strong>
                  {displayDate(weekStart)} –{' '}
                  {displayDate(addDays(weekStart, 4))}
                </strong>

                <button
                  onClick={() => moveWeek(1)}
                  aria-label="Nächste Woche"
                >
                  <ChevronRight size={20} />
                </button>

                <button
                  onClick={() =>
                    setWeekStart(mondayOf(new Date()))
                  }
                >
                  Diese Woche
                </button>

                <button
                  className="primary"
                  onClick={() => window.print()}
                >
                  <Printer size={17} />
                  Drucken
                </button>
              </div>
            </div>

            <p className="save-status" role="status">
              {saved
                ? '✓ Automatisch in diesem Browser gespeichert'
                : '⚠ Speichern fehlgeschlagen'}
            </p>

            <div className="days-container">
              {DAYS.map((day, index) => {
                const dayRows = rows.filter(
                  row => row.day === day
                );

                const dayTotal = dayRows.reduce(
                  (sum, row) =>
                    sum + (Number(row.portions) || 0),
                  0
                );

                return (
                  <section className="day-card" key={day}>
                    <div className="day-card-header">
                      <h3>{day}</h3>
                      <span>
                        {displayDate(
                          addDays(weekStart, index)
                        )}
                      </span>
                    </div>

                    {MEAL_TYPES
                      .filter(type =>
                        currentKitchen.meals.includes(type)
                      )
                      .map(type => {
                        const typeRows = dayRows.filter(
                          row =>
                            (row.type || 'Mittagessen') === type
                        );

                        const typeTotal = typeRows.reduce(
                          (sum, row) =>
                            sum + (Number(row.portions) || 0),
                          0
                        );

                        return (
                          <div
                            className="meal-section"
                            key={type}
                          >
                            <div className="meal-section-header">
                              <h4>
                                {MEAL_ICONS[type]} {type}
                              </h4>
                              <span>
                                {typeTotal} Portionen
                              </span>
                            </div>

                            {typeRows.length === 0 && (
                              <p className="empty-meal">
                                Noch kein Gericht geplant
                              </p>
                            )}

                            {typeRows.map(row => {
                              const isEditing =
                                editingIds.includes(row.id);

                              return (
                                <div
                                  className="dish-card"
                                  key={row.id}
                                >
                                  {isEditing ? (
                                    <div className="dish-edit">
                                      <label>
                                        Gericht
                                        <input
                                          type="text"
                                          value={row.name || ''}
                                          placeholder="Gericht eingeben"
                                          maxLength={150}
                                          onChange={e =>
                                            editMeal(
                                              row.id,
                                              'name',
                                              e.target.value
                                            )
                                          }
                                        />
                                      </label>

                                      <label>
                                        Portionen
                                        <input
                                          type="number"
                                          min="0"
                                          max="500"
                                          step="1"
                                          value={row.portions}
                                          onChange={e => {
                                            const value =
                                              e.target.value;
                                            const n =
                                              Number(value);

                                            if (
                                              value === '' ||
                                              (
                                                Number.isInteger(n) &&
                                                n >= 0 &&
                                                n <= 500
                                              )
                                            ) {
                                              editMeal(
                                                row.id,
                                                'portions',
                                                value === ''
                                                  ? ''
                                                  : n
                                              );
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  ) : (
                                    <div className="dish-info">
                                      <strong>
                                        {row.name ||
                                          'Unbenanntes Gericht'}
                                      </strong>

                                      <span>
                                        {Number(row.portions) || 0}
                                        {' '}Portionen
                                      </span>
                                    </div>
                                  )}

                                  <div className="dish-actions">
                                    <button
                                      className="edit-button"
                                      onClick={() =>
                                        toggleEditing(row.id)
                                      }
                                    >
                                      {isEditing ? (
                                        <>
                                          <Check size={17} />
                                          Fertig
                                        </>
                                      ) : (
                                        <>
                                          <Pencil size={17} />
                                          Bearbeiten
                                        </>
                                      )}
                                    </button>

                                    {isEditing && (
                                      <button
                                        className="danger"
                                        aria-label="Gericht löschen"
                                        onClick={() =>
                                          removeMeal(row.id)
                                        }
                                      >
                                        <Trash2 size={17} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            <button
                              className="add-meal-button"
                              onClick={() =>
                                addMeal(day, type)
                              }
                            >
                              <Plus size={17} />
                              Gericht hinzufügen
                            </button>
                          </div>
                        );
                      })}

                    <div className="day-card-footer">
                      <strong>
                        Tagessumme: {dayTotal} Portionen
                      </strong>

                      {dayTotal > 500 && (
                        <span className="warning">
                          ⚠ Über 500 Portionen!
                        </span>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="summary">
              <h3>Wochenübersicht</h3>

              {MEAL_TYPES.map(type => (
                <p key={type}>
                  {type}:{' '}
                  <strong>
                    {totalsByType[type]} Portionen
                  </strong>
                </p>
              ))}

              <p>
                <strong>
                  Gesamt: {total} Portionen
                  {' '}in {rows.length} Gerichten
                </strong>
              </p>
            </div>
          </section>
        )}

        {page === 'Küchen' && (
          <section className="meal-plan">
            <div className="kitchen-heading">
              <div>
                <h2>Küchenverwaltung</h2>
                <p>
                  Verwalte deine Küchen und deren Mahlzeiten.
                </p>
              </div>

              <button
                className="add-meal-button"
                onClick={openNewKitchen}
              >
                <Plus size={18} />
                Neue Küche
              </button>
            </div>

            {showKitchenForm && (
              <form
                className="kitchen-form"
                onSubmit={saveKitchen}
              >
                <h3>
                  {editingKitchenId
                    ? 'Küche bearbeiten'
                    : 'Neue Küche anlegen'}
                </h3>

                <label>
                  Küchenname
                  <input
                    required
                    maxLength={100}
                    value={kitchenForm.name}
                    onChange={e =>
                      setKitchenForm(prev => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    placeholder="z. B. Kita Regenbogen"
                  />
                </label>

                <label>
                  Anzahl Essensteilnehmer
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={kitchenForm.participants}
                    onChange={e =>
                      setKitchenForm(prev => ({
                        ...prev,
                        participants: e.target.value
                      }))
                    }
                  />
                </label>

                <fieldset>
                  <legend>Angebotene Mahlzeiten</legend>

                  {MEAL_TYPES.map(type => (
                    <label
                      className="meal-checkbox"
                      key={type}
                    >
                      <input
                        type="checkbox"
                        checked={
                          kitchenForm.meals.includes(type)
                        }
                        onChange={() =>
                          toggleKitchenMeal(type)
                        }
                      />
                      {MEAL_ICONS[type]} {type}
                    </label>
                  ))}
                </fieldset>

                {!editingKitchenId && (
                  <label>
                    Speiseplan für diese Woche
                    <select
                      value={kitchenForm.copyFrom}
                      onChange={e =>
                        setKitchenForm(prev => ({
                          ...prev,
                          copyFrom: e.target.value
                        }))
                      }
                    >
                      <option value="">
                        Leeren Speiseplan erstellen
                      </option>

                      {kitchens.map(item => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          Von {item.name} übernehmen
                        </option>
                      ))}
                    </select>

                    <small>
                      Beim Kopieren werden die Gerichte
                      übernommen. Die Portionszahlen
                      beginnen bei 0 und können
                      angepasst werden.
                    </small>
                  </label>
                )}

                <div className="kitchen-form-actions">
                  <button
                    type="submit"
                    className="edit-button"
                  >
                    <Check size={17} />
                    Küche speichern
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setShowKitchenForm(false)
                    }
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}

            <div className="kitchen-grid">
              {kitchens.map(item => (
                <article
                  className="kitchen-card"
                  key={item.id}
                >
                  <h3>🏢 {item.name}</h3>

                  <p>
                    <strong>{item.participants}</strong>
                    {' '}Essensteilnehmer
                  </p>

                  <div className="kitchen-meals">
                    {item.meals.map(type => (
                      <span key={type}>
                        {MEAL_ICONS[type]} {type}
                      </span>
                    ))}
                  </div>

                  <div className="kitchen-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        openEditKitchen(item)
                      }
                    >
                      <Pencil size={16} />
                      Bearbeiten
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteKitchen(item)
                      }
                    >
                      <Trash2 size={16} />
                      Löschen
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {page === 'Hauptspeisepläne' && (
  
  
  
  

  <section className="meal-plan">
    <h2>🍽️ Hauptspeisepläne</h2>

    <p>
      Erstelle verschiedene Speisepläne für Kitas,
      Schulen und Firmenkantinen.
    </p>

    <button
      className="primary"
      onClick={createTemplate}
    >
      <Plus size={18} />
      Neuen Hauptspeiseplan erstellen
    </button>

    <div className="kitchen-grid" style={{ marginTop: 20 }}>
      {templates.map(item => (
        <article className="kitchen-card" key={item.id}>
          <h3>📋 {item.name}</h3>

          <button
            className="edit-button"
            onClick={() => setTemplateId(item.id)}
          >
            {templateId === item.id
              ? '✓ Ausgewählt'
              : 'Auswählen'}
          </button>
        </article>
      ))}
    </div>

    {templates.length === 0 && (
      <p>Noch keine Hauptspeisepläne vorhanden.</p>
    )}
{templateId && (
  <div style={{ marginTop: 30 }}>
    <h3>📅 Wochenplan bearbeiten</h3>
<div className="week-selector">
  {[1, 2, 3, 4].map(week => (
    <button
      key={week}
      type="button"
      className={templateWeek === week ? 'primary' : ''}
      onClick={() => setTemplateWeek(week)}
    >
      Woche {week}
    </button>
  ))}
</div>
    {DAYS.map(day => (
      <div key={day} className="day-card">
        <h3>{day}</h3>

        {MEAL_TYPES.map(type => (
          <div key={type} style={{ marginBottom: 20 }}>
            <h4>{MEAL_ICONS[type]} {type}</h4>

            {(templatePlans[`${templateId}::${templateWeek}`] || [])
              .filter(row => row.day === day && row.type === type)
              .map(row => (
                <input
                  key={row.id}
                  type="text"
                  placeholder="Gericht eingeben"
                  value={row.name}
                  onChange={e =>
                    editTemplateMeal(row.id, 'name', e.target.value)
                  }
                />
              ))}

            <button
              type="button"
              onClick={() => addTemplateMeal(day, type)}
            >
              + Gericht hinzufügen
            </button>
          </div>
        ))}
      </div>
    ))}
  </div>
)} 
{templateId && (
  <button
    type="button"
    className="primary"
    onClick={() => setShowDistribution(true)}
  >
    📤 Auf Küchen verteilen
  </button>
      )}
{showDistribution && (
  <div className="kitchen-card" style={{ marginTop: 20, padding: 20 }}>
    <h3>📤 Hauptspeiseplan verteilen</h3>
    <p>Wähle die Küchen aus, die diesen Speiseplan erhalten sollen.</p>
<div style={{ marginBottom: 20 }}>
  <h4>📅 Welche Wochen verteilen?</h4>

  <label style={{ display: 'block', marginBottom: 10 }}>
    <input
      type="radio"
      name="distributionMode"
      checked={distributionMode === 'single'}
      onChange={() => setDistributionMode('single')}
    />
    {' '}Nur Woche {templateWeek}
  </label>

  <label style={{ display: 'block' }}>
    <input
      type="radio"
      name="distributionMode"
      checked={distributionMode === 'all'}
      onChange={() => setDistributionMode('all')}
    />
    {' '}Alle 4 Wochen
  </label>
</div>
 <div style={{ marginBottom: 20 }}>
  <h4>🔄 Wie sollen die Gerichte übertragen werden?</h4>

  <label style={{ display: 'block', marginBottom: 10 }}>
    <input
      type="radio"
      name="distributionAction"
      checked={distributionAction === 'replace'}
      onChange={() => setDistributionAction('replace')}
    />
    {' '}Vorhandene Gerichte ersetzen
  </label>

  <label style={{ display: 'block' }}>
    <input
      type="radio"
      name="distributionAction"
      checked={distributionAction === 'append'}
      onChange={() => setDistributionAction('append')}
    />
    {' '}Zu vorhandenen Gerichten hinzufügen
  </label>
</div>
    {kitchens.map(kitchen => (
      <label
        key={kitchen.id}
        style={{ display: 'block', marginBottom: 12 }}
      >
        <input
          type="checkbox"
          checked={targetKitchenIds.includes(kitchen.id)}
          onChange={e =>
            setTargetKitchenIds(prev =>
              e.target.checked
                ? [...prev, kitchen.id]
                : prev.filter(id => id !== kitchen.id)
            )
          }
        />
        {' '}{kitchen.name}
      </label>
    ))}

    <button
      type="button"
      className="primary"
      onClick={distributeTemplate}
    >
      Jetzt verteilen
    </button>

    <button
      type="button"
      onClick={() => setShowDistribution(false)}
    >
      Abbrechen
    </button>
  </div>
)}  
  </section>
)}
   {page === 'Rezepte' && (
  <section className="meal-plan">
    <h2>📖 Rezeptverwaltung</h2>
    <p>
      Hier verwalten wir künftig alle Rezepte
      für Kitas, Schulen und Firmenkantinen.
    </p>

    <button
      className="primary"
      type="button"
      onClick={() => setShowRecipeForm(true)}
    >
      + Neues Rezept
    </button>
    <h3>Gespeicherte Rezepte</h3>

{recipes.length === 0 ? (
  <p>Noch keine Rezepte gespeichert.</p>
) : (
  <div>
    {recipes.map((recipe) => (
      <div className="meal-plan" key={recipe.id}>
        <h4>{recipe.name}</h4>
        <p>Kategorie: {recipe.category}</p>
        <p>Portionen: {recipe.portions}</p>
      </div>
    ))}
  </div>
)}
{showRecipeForm && (
  <div className="meal-plan">
    <h3>Neues Rezept anlegen</h3>

    <label>Rezeptname</label>
  <input
  type="text"
  placeholder="z. B. Nudeln mit Tomatensoße"
  value={recipeName}
  onChange={(e) => setRecipeName(e.target.value)}
/>
    <label>Kategorie</label>
   <select
  value={recipeCategory}
  onChange={(e) => setRecipeCategory(e.target.value)}
>
      <option>Hauptgericht</option>
      <option>Beilage</option>
      <option>Dessert</option>
      <option>Vesper</option>
    </select>

   <label>Portionen</label>
<input
  type="number"
  min="1"
  value={recipePortions}
  onChange={(e) => setRecipePortions(Number(e.target.value))}
/>
    <input
      type="number"
      min="1"
      defaultValue="10"
    />
<button
  type="button"
  className="primary"
  onClick={saveRecipe}
>
  Rezept speichern
</button>
    <button
      type="button"
      onClick={() => setShowRecipeForm(false)}
    >
      Abbrechen
    </button>
  </div>
)}
  </section>
)}     {![
          'Dashboard',
          'Speiseplanung',
          'Küchen',
      'Hauptspeisepläne'
        ].includes(page) && (
          <section className="meal-plan">
            <h2>{page}</h2>
            <p>
              Dieser Bereich wird später umgesetzt.
            </p>

            <button
              className="primary"
              onClick={() =>
                setPage('Speiseplanung')
              }
            >
              Zur Speiseplanung
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
