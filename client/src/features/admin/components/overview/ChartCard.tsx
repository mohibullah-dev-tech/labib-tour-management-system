import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { ChartSeriesPoint } from '@/features/admin/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ChartCardProps {
  title: string;
  description?: string;
  data: ChartSeriesPoint[];
  variant: 'bar' | 'line';
  /** Formats the tooltip/axis value — e.g. BDT currency vs. a plain count. */
  formatValue?: (value: number) => string;
}

/**
 * Real charts (Recharts, already in the project's dependencies from
 * project setup — not a new library) rendering the mock series data from
 * data/dashboard.ts. "Placeholder" per the brief refers to the DATA
 * source, not the chart itself: swap the `data` prop for a TanStack
 * Query result later and this component doesn't change at all.
 */
function ChartCard({
  title,
  description,
  data,
  variant,
  formatValue = (v) => String(v),
}: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'bar' ? (
              <BarChart data={data} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  tickFormatter={formatValue}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number) => formatValue(value)}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: 'hsl(var(--border))',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  tickFormatter={formatValue}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number) => formatValue(value)}
                  contentStyle={{
                    borderRadius: 8,
                    borderColor: 'hsl(var(--border))',
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary-600)"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { ChartCard };
