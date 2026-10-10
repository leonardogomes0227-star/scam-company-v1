import { useMemo, useState } from 'react';
import { formatBRL } from '../../lib/format';
import { cx } from '../../components/ui';

export interface DayPoint {
  day: string; // YYYY-MM-DD
  revenue: number;
  orders: number;
}

const weekday = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const dayMonth = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

function parseDay(day: string) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Valor "redondo" acima do máximo para as linhas de grade. */
function niceMax(value: number) {
  if (value <= 0) return 100;
  const pow = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= value) ?? 10;
  return step * pow;
}

const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });

export default function SalesChart({ data }: { data: DayPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = useMemo(() => niceMax(Math.max(...data.map((d) => d.revenue))), [data]);
  const ticks = [max, max / 2, 0];
  const active = hover != null ? data[hover] : null;

  return (
    <div>
      <div className="relative h-56 flex">
        {/* Eixo Y */}
        <div className="w-12 shrink-0 flex flex-col justify-between text-[11px] text-ink-soft tabular-nums pb-6 -mt-1.5">
          {ticks.map((t) => <span key={t}>{t === 0 ? '0' : `R$${compact.format(t)}`}</span>)}
        </div>
        <div className="relative flex-1">
          {/* Linhas de grade */}
          <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
            {ticks.map((t) => <div key={t} className={cx('border-t', t === 0 ? 'border-black/15' : 'border-dashed border-black/[0.07]')} />)}
          </div>
          {/* Barras */}
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {data.map((d, i) => (
              <div
                key={d.day}
                className="flex-1 h-full flex items-end justify-center cursor-default"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${dayMonth.format(parseDay(d.day))}: ${formatBRL(d.revenue)} em ${d.orders} pedido(s)`}
              >
                <div
                  className={cx('w-full max-w-[28px] rounded-t-[4px] transition-colors', hover === i ? 'bg-brand-700' : 'bg-brand-500')}
                  style={{ height: d.revenue > 0 ? `max(${(d.revenue / max) * 100}%, 3px)` : 0 }}
                />
              </div>
            ))}
          </div>
          {/* Rótulos do eixo X */}
          <div className="absolute inset-x-0 bottom-0 h-5 flex gap-[2px] text-[10.5px] text-ink-soft">
            {data.map((d, i) => (
              <span key={d.day} className={cx('flex-1 text-center truncate', i % 2 === 1 && data.length > 10 && 'invisible sm:visible')}>
                {dayMonth.format(parseDay(d.day))}
              </span>
            ))}
          </div>
          {/* Tooltip */}
          {active && hover != null && (
            <div
              className="absolute -top-2 z-10 -translate-x-1/2 -translate-y-full pointer-events-none rounded-xl bg-ink text-white px-3 py-2 text-xs shadow-lift whitespace-nowrap"
              style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
            >
              <p className="text-white/60 capitalize">{weekday.format(parseDay(active.day))}, {dayMonth.format(parseDay(active.day))}</p>
              <p className="font-semibold text-sm tabular-nums">{formatBRL(active.revenue)}</p>
              <p className="text-white/60">{active.orders} {active.orders === 1 ? 'pedido pago' : 'pedidos pagos'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Versão em tabela para leitores de tela */}
      <table className="sr-only">
        <caption>Faturamento por dia</caption>
        <thead><tr><th>Dia</th><th>Faturamento</th><th>Pedidos</th></tr></thead>
        <tbody>
          {data.map((d) => <tr key={d.day}><td>{d.day}</td><td>{formatBRL(d.revenue)}</td><td>{d.orders}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}
