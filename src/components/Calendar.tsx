import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (d: Date) => {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const isSelected = (d: Date) => {
    return d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate();
  };

  const isFuture = (d: Date) => d > today;

  const monthName = viewMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => {
    const next = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setViewMonth(next);
    }
  };

  const handleDayClick = (d: Date) => {
    if (isFuture(d)) return;
    onDateSelect(d);
    setIsOpen(false);
  };

  const formatDate = (d: Date) => {
    if (isToday(d)) return 'Today';
    return d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
          isToday(selectedDate)
            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
        }`}
      >
        <span>{formatDate(selectedDate)}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-50 w-72">
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm font-semibold text-slate-900">{monthName}</span>
            <button
              onClick={nextMonth}
              disabled={viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth()}
              className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-xs font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const future = isFuture(day);
              const selected = isSelected(day);
              const todayDate = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={future}
                  className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-colors ${
                    selected
                      ? 'bg-blue-600 text-white font-semibold'
                      : todayDate
                        ? 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200'
                        : future
                          ? 'text-slate-200 cursor-not-allowed'
                          : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {!isToday(selectedDate) && (
            <button
              onClick={() => { onDateSelect(new Date()); setIsOpen(false); }}
              className="mt-3 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
            >
              Back to today
            </button>
          )}
        </div>
      )}
    </div>
  );
}
