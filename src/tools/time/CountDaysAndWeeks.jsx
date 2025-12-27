import React, { useState, useEffect } from 'react';
import moment from 'moment';

export const metadata = {
  id: 'count-days-weeks',
  name: 'Count Days & Weeks',
  description: 'Given a date, show its ISO week number and the week\'s days in the year',
  category: 'time'
};

const CountDaysAndWeeks = () => {
  const [inputDate, setInputDate] = useState('');
  const [freeText, setFreeText] = useState('');
  const [date, setDate] = useState(moment());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!inputDate && !freeText) {
      setDate(moment());
      setError(null);
      return;
    }
    let parsed;
    if (inputDate) {
      parsed = moment(inputDate, 'YYYY-MM-DD', true);
    } else {
      parsed = moment(freeText);
    }
    if (!parsed.isValid()) {
      setError('Invalid date');
    } else {
      setError(null);
      setDate(parsed);
    }
  }, [inputDate, freeText]);

  const handleUseToday = () => {
    setInputDate('');
    setFreeText('');
    setDate(moment());
    setError(null);
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch {}
  };

  // compute values
  const year = date.year();
  const isoWeek = date.isoWeek();
  const weekStart = date.clone().startOf('isoWeek'); // Monday
  const weekEnd = date.clone().endOf('isoWeek'); // Sunday
  const daysOfWeek = [...Array(7)].map((_, i) => weekStart.clone().add(i, 'days'));
  const dayOfYear = date.dayOfYear();
  const daysInYear = date.isLeapYear() ? 366 : 365;
  const daysRemaining = daysInYear - dayOfYear;
  const isoWeeksInYear = date.clone().isoWeeksInYear();

  return (
    <div className="tool-container">
      <h2>Count Days & Weeks</h2>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Pick a date</label>
        <input
          type="date"
          value={inputDate}
          onChange={(e) => { setInputDate(e.target.value); setFreeText(''); }}
          style={{ padding: 8, marginRight: 8 }}
        />
        <button onClick={handleUseToday} style={{ padding: '8px 12px' }}>Use Today</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Or paste a date string</label>
        <input
          type="text"
          value={freeText}
          onChange={(e) => { setFreeText(e.target.value); setInputDate(''); }}
          placeholder="e.g. 2025-02-14 or Feb 14 2025"
          style={{ width: '100%', padding: 8, fontFamily: 'monospace' }}
        />
      </div>

      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {!error && (
        <>
          <div style={{ marginBottom: 12, padding: 12, background: '#f7f7f7', borderRadius: 6 }}>
            <div style={{ marginBottom: 6 }}><strong>Selected Date:</strong> <code style={{ fontFamily: 'monospace' }}>{date.format('YYYY-MM-DD (dddd)')}</code> <button onClick={() => copy(date.format())}>Copy</button></div>
            <div style={{ marginBottom: 6 }}><strong>Year:</strong> {year}</div>
            <div style={{ marginBottom: 6 }}><strong>ISO Week Number:</strong> {isoWeek} / {isoWeeksInYear} <small style={{ color: '#666' }}>(ISO weeks in year)</small></div>
            <div style={{ marginBottom: 6 }}><strong>Day of Year:</strong> {dayOfYear} / {daysInYear}</div>
            <div style={{ marginBottom: 6 }}><strong>Days Remaining in Year:</strong> {daysRemaining}</div>
            <div><strong>Week Range:</strong> {weekStart.format('YYYY-MM-DD')} — {weekEnd.format('YYYY-MM-DD')}</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <h4>Days in ISO Week #{isoWeek}</h4>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {daysOfWeek.map((d, i) => (
                <div key={i} style={{ padding: 8, border: '1px solid #eee', borderRadius: 4, minWidth: 160, background: '#fff' }}>
                  <div style={{ fontWeight: 'bold' }}>{d.format('dddd')}</div>
                  <div style={{ fontFamily: 'monospace' }}>{d.format('YYYY-MM-DD')}</div>
                  <div style={{ color: '#666', fontSize: '0.9em' }}>Day #{d.dayOfYear()} of {d.year()}</div>
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => copy(d.format('YYYY-MM-DD'))} style={{ padding: '4px 8px' }}>Copy Date</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CountDaysAndWeeks;
