"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export type Period = 1 | 3 | 6 | 12;

interface ChartDataPoint {
  monthLabel?: string;
  stages?: number;
  baptemes?: number;
  giftVouchers?: number;
  pendingBalance?: number;
  [key: string]: unknown;
}

interface DashboardRevenueChartProps {
  periodData: ChartDataPoint[];
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export function DashboardRevenueChart({
  periodData,
  period,
  onPeriodChange,
}: DashboardRevenueChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">Évolution du CA</CardTitle>
          <div className="flex gap-1">
            {([1, 3, 6, 12] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => onPeriodChange(p)}
              >
                {p === 1 ? "1M" : p === 3 ? "3M" : p === 6 ? "6M" : "12M"}
              </Button>
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">
          Encaissé par produit + soldes en attente
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={periodData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="monthLabel"
              angle={-30}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(value) => `${Number(value).toLocaleString("fr-FR")}€`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value ?? 0).toLocaleString("fr-FR")}€`,
                name,
              ]}
              labelStyle={{ color: "#111" }}
            />
            <Legend />
            <Bar dataKey="stages" stackId="a" fill="#2563eb" name="Stages" radius={[0, 0, 0, 0]} />
            <Bar dataKey="baptemes" stackId="a" fill="#0ea5e9" name="Baptêmes" radius={[0, 0, 0, 0]} />
            <Bar dataKey="giftVouchers" stackId="a" fill="#10b981" name="Bons cadeaux" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendingBalance" stackId="a" fill="#f59e0b" name="Soldes en attente" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
