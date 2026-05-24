"use client";

import { useState } from "react";
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
import type { ChartDataPoint, Period } from "../_types";

interface DashboardRevenueChartProps {
  byMonth: ChartDataPoint[];
}

export function DashboardRevenueChart({ byMonth }: DashboardRevenueChartProps) {
  const [period, setPeriod] = useState<Period>(12);
  const periodData = byMonth.slice(-period);

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
                onClick={() => setPeriod(p)}
              >
                {p === 1 ? "1M" : p === 3 ? "3M" : p === 6 ? "6M" : "12M"}
              </Button>
            ))}
          </div>
        </div>
        <CardDescription className="text-xs">
          Encaissé en ligne · Encaissé manuellement · Soldes en attente
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
            <Bar dataKey="online" stackId="a" fill="#2563eb" name="En ligne" radius={[0, 0, 0, 0]} />
            <Bar dataKey="manual" stackId="a" fill="#64748b" name="Manuel" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendingBalance" stackId="a" fill="#f59e0b" name="Soldes en attente" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
