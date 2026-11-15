import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Calculator,
  ShoppingCart,
  Building2,
  Settings
} from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [kitchen, setKitchen] = useState('Kita Sonnenblume');

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Speiseplanung', icon: CalendarDays },
    { name: 'Rezepte', icon: BookOpen },
    { name: 'Kalkulation', icon: Calculator },
    { name: 'Einkaufslisten', icon: ShoppingCart },
    { name: 'Küchen', icon: Building2 },
    { name: 'Einstellungen', icon: Settings }
  ];

  const meals = [
    ['Montag', 'Spaghetti mit Tomatensoße', 180],
    ['Dienstag', 'Hähnchengeschnetzeltes mit Reis', 185],
    ['Mittwoch', 'Kartoffelsuppe', 190],
    ['Donnerstag', 'Seelachs mit Kartoffeln', 175],
    ['Freitag', 'Milchreis mit Apfelmus', 180]
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🍽️ MenüPlaner</h2>
        <p>Kita & Business</p>

        <nav>
          {menu.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={activePage === name ? 'active' : ''}
              onClick={() => setActivePage(name)}
            >
              <Icon size={20} />
              {name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <h1>{activePage}</h1>

          <select
            value={kitchen}
            onChange={(e) => setKitchen(e.target.value)}
          >
            <option>Kita Sonnenblume</option>
            <option>Firmenkantine Leipzig</option>
          </select>
        </header>

        <section className="welcome">
          <h2>Willkommen im MenüPlaner!</h2>
          <p>Aktuelle Küche: {kitchen}</p>
        </section>

        <section className="stats">
          <div className="card">
            <h3>Geplante Essen</h3>
            <strong>185</strong>
          </div>

          <div className="card">
            <h3>Wareneinsatz / Portion</h3>
            <strong>1,92 €</strong>
          </div>

          <div className="card">
            <h3>Wochenbudget</h3>
            <strong>1.850 €</strong>
          </div>

          <div className="card">
            <h3>Rezepte</h3>
            <strong>100</strong>
          </div>
        </section>

        <section className="meal-plan">
          <h2>📅 Aktueller Wochenspeiseplan</h2>

          <table>
            <thead>
              <tr>
                <th>Wochentag</th>
                <th>Hauptgericht</th>
                <th>Portionen</th>
              </tr>
            </thead>

            <tbody>
              {meals.map(([day, meal, portions]) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>{meal}</td>
                  <td>{portions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
