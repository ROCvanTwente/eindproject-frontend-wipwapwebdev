import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { Activity, Eye, Footprints, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../app/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../../app/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../app/components/ui/table';
import { analyticsService } from '../../services/analyticsService';
import type { AnalyticsSummary } from '../../types';

const chartConfig = {
  visitors: { label: 'Bezoekers', color: '#004B98' },
  pageViews: { label: 'Paginaweergaves', color: '#0064AD' },
  routeStarts: { label: 'Route starts', color: '#E3001A' },
  starts: { label: 'Starts', color: '#004B98' },
  views: { label: 'Weergaves', color: '#0064AD' },
} satisfies ChartConfig;

const routeColors = ['#004B98', '#0064AD', '#E3001A', '#FFF265', '#00A3A6', '#708090'];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: 'short' }).format(new Date(value));
}

export function StatisticsAdmin() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    analyticsService
      .getSummary()
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : 'Statistieken laden mislukt'))
      .finally(() => setLoading(false));
  }, []);

  const dailyData = useMemo(
    () =>
      (summary?.dailyMetrics ?? []).map((item) => ({
        ...item,
        label: formatDate(item.date),
      })),
    [summary],
  );

  if (loading) {
    return <p>Statistieken laden...</p>;
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!summary) {
    return null;
  }

  const topRoute = summary.routeStarts[0];

  return (
    <section className="space-y-5">
      <div>
        <p className="roc-kicker text-primary">beheer</p>
        <h1 className="roc-title mt-1">statistieken</h1>
        <p className="roc-copy mt-3 max-w-3xl">
          Inzicht in bezoekers, paginaweergaves en welke rondleidingsroutes het vaakst gestart worden.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="bezoekers" value={summary.totalVisitors} description="unieke bezoekers in 30 dagen" icon={Users} />
        <StatCard title="paginaweergaves" value={summary.totalPageViews} description="publieke pagina's bekeken" icon={Eye} />
        <StatCard title="route starts" value={summary.totalRouteStarts} description="gestarte rondleidingen" icon={Footprints} />
        <StatCard title="populairste route" value={topRoute?.starts ?? 0} description={topRoute?.routeName ?? 'nog geen route gestart'} icon={Activity} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>bezoekers per dag</CardTitle>
            <CardDescription>Unieke bezoekers, paginaweergaves en route-starts in de laatste 30 dagen.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <LineChart data={dailyData} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="pageViews" stroke="var(--color-pageViews)" strokeWidth={3} dot={false} name="Paginaweergaves" />
                <Line type="monotone" dataKey="visitors" stroke="var(--color-visitors)" strokeWidth={3} dot={false} name="Bezoekers" />
                <Line type="monotone" dataKey="routeStarts" stroke="var(--color-routeStarts)" strokeWidth={3} dot={false} name="Route starts" />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>route verdeling</CardTitle>
            <CardDescription>Welke routes worden het vaakst gestart.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.routeStarts.length ? (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="routeName" />} />
                  <Pie data={summary.routeStarts} dataKey="starts" nameKey="routeName" innerRadius={62} outerRadius={108} paddingAngle={3}>
                    {summary.routeStarts.map((item, index) => (
                      <Cell key={item.routeName} fill={routeColors[index % routeColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <EmptyState text="Nog geen gestarte routes om te tonen." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>routes gestart</CardTitle>
            <CardDescription>Top 10 routes op basis van starts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.routeStarts.length ? (
              <>
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                  <BarChart data={summary.routeStarts} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="routeName" width={120} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="starts" fill="var(--color-starts)" radius={[0, 4, 4, 0]} name="Starts" />
                  </BarChart>
                </ChartContainer>
                <MetricTable rows={summary.routeStarts.map((item) => ({ label: item.routeName, value: item.starts }))} valueLabel="starts" />
              </>
            ) : (
              <EmptyState text="Nog geen route-starts geregistreerd." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>populaire pagina's</CardTitle>
            <CardDescription>Meest bekeken publieke routes en pagina's.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.popularPages.length ? (
              <>
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                  <BarChart data={summary.popularPages} margin={{ left: 8, right: 8 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="path" tickLine={false} axisLine={false} minTickGap={18} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="var(--color-views)" radius={[4, 4, 0, 0]} name="Weergaves" />
                  </BarChart>
                </ChartContainer>
                <MetricTable rows={summary.popularPages.map((item) => ({ label: item.path, value: item.views }))} valueLabel="weergaves" />
              </>
            ) : (
              <EmptyState text="Nog geen paginaweergaves geregistreerd." />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function StatCard({ title, value, description, icon: Icon }: { title: string; value: number; description: string; icon: typeof Users }) {
  return (
    <Card>
      <CardHeader className="grid-cols-[1fr_auto] gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span className="bg-primary/10 p-2 text-primary">
          <Icon className="size-5" />
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricTable({ rows, valueLabel }: { rows: Array<{ label: string; value: number }>; valueLabel: string }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>naam</TableHead>
          <TableHead className="text-right">{valueLabel}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.label}>
            <TableCell className="max-w-[280px] truncate">{row.label}</TableCell>
            <TableCell className="text-right font-semibold text-primary">{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">{text}</div>;
}
