"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { DadosClimaticos } from '@agronexus/shared/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherChartProps {
  dados: DadosClimaticos[];
  tipo: 'chuva' | 'temperatura' | 'uv';
}

interface MonthGroup {
  label: string;
  precipitacao_total: number;
  temp_max_media: number;
  temp_min_media: number;
  uv_media: number;
}

function groupByMonth(dados: DadosClimaticos[]): MonthGroup[] {
  const months = new Map<string, DadosClimaticos[]>();
  for (const d of dados) {
    const key = d.data.substring(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key)!.push(d);
  }
  return Array.from(months.entries()).map(([month, days]) => {
    const uvDays = days.filter(d => d.uv_index != null);
    const labelRaw = new Date(month + '-15T12:00:00').toLocaleDateString('pt-BR', { month: 'long' });
    // Capitalizar a primeira letra do mês
    const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1);
    
    return {
      label,
      precipitacao_total: parseFloat((days.reduce((s, d) => s + (d.precipitacao_mm || 0), 0) / days.length).toFixed(1)),
      temp_max_media: parseFloat((days.reduce((s, d) => s + (d.temp_max_c || 0), 0) / days.length).toFixed(1)),
      temp_min_media: parseFloat((days.reduce((s, d) => s + (d.temp_min_c || 0), 0) / days.length).toFixed(1)),
      uv_media: uvDays.length > 0
        ? parseFloat((uvDays.reduce((s, d) => s + (d.uv_index || 0), 0) / uvDays.length).toFixed(1))
        : 0,
    };
  });
}

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { grid: { color: '#f1f3f5' }, ticks: { font: { size: 10 } } },
    x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 } },
  },
};

export default function WeatherChart({ dados, tipo }: WeatherChartProps) {
  const useMonthly = dados.length > 45;

  if (tipo === 'chuva') {
    if (useMonthly) {
      const grupos = groupByMonth(dados);
      return (
        <div className="h-64">
          <Bar
            data={{
              labels: grupos.map(g => g.label),
              datasets: [{
                label: 'Precipitação média (mm)',
                data: grupos.map(g => g.precipitacao_total),
                backgroundColor: 'rgba(0, 89, 193, 0.6)',
                borderColor: '#0059c1',
                borderWidth: 1,
                borderRadius: 4,
              }],
            }}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#1a1a1a',
                  padding: 12,
                  bodyFont: { size: 13, weight: 'bold' as const },
                  callbacks: { label: (ctx: any) => ` ${ctx.raw} mm (média do mês)` },
                },
              },
            }}
          />
        </div>
      );
    }

    const dailyLabels = dados.map(d =>
      new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    );
    return (
      <div className="h-64">
        <Bar
          data={{
            labels: dailyLabels,
            datasets: [{
              label: 'Precipitação (mm)',
              data: dados.map(d => d.precipitacao_mm || 0),
              backgroundColor: 'rgba(0, 89, 193, 0.6)',
              borderColor: '#0059c1',
              borderWidth: 1,
              borderRadius: 4,
            }],
          }}
          options={{
            ...BASE_OPTIONS,
            plugins: {
              legend: { display: false },
              tooltip: { backgroundColor: '#1a1a1a', padding: 12, bodyFont: { size: 14, weight: 'bold' as const } },
            },
          }}
        />
      </div>
    );
  }

  if (tipo === 'temperatura') {
    if (useMonthly) {
      const grupos = groupByMonth(dados);
      return (
        <div className="h-64">
          <Line
            data={{
              labels: grupos.map(g => g.label),
              datasets: [
                {
                  label: 'Máx média (°C)',
                  data: grupos.map(g => g.temp_max_media),
                  borderColor: '#e63946',
                  backgroundColor: 'rgba(230, 57, 70, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
                {
                  label: 'Mín média (°C)',
                  data: grupos.map(g => g.temp_min_media),
                  borderColor: '#457b9d',
                  backgroundColor: 'rgba(69, 123, 157, 0.1)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={{
              ...BASE_OPTIONS,
              plugins: {
                legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10, weight: 'bold' as const } } },
                tooltip: {
                  backgroundColor: '#1a1a1a',
                  callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}°C (média do mês)` },
                },
              },
            }}
          />
        </div>
      );
    }

    const dailyLabels = dados.map(d =>
      new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    );
    return (
      <div className="h-64">
        <Line
          data={{
            labels: dailyLabels,
            datasets: [
              {
                label: 'Máx (°C)',
                data: dados.map(d => d.temp_max_c || 0),
                borderColor: '#e63946',
                backgroundColor: 'rgba(230, 57, 70, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Mín (°C)',
                data: dados.map(d => d.temp_min_c || 0),
                borderColor: '#457b9d',
                backgroundColor: 'rgba(69, 123, 157, 0.1)',
                tension: 0.4,
                fill: true,
              },
            ],
          }}
          options={{
            ...BASE_OPTIONS,
            plugins: {
              legend: { position: 'top' as const, labels: { boxWidth: 10, font: { size: 10, weight: 'bold' as const } } },
              tooltip: { backgroundColor: '#1a1a1a' },
            },
          }}
        />
      </div>
    );
  }

  // tipo === 'uv'
  if (useMonthly) {
    const grupos = groupByMonth(dados);
    const uvValues = grupos.map(g => g.uv_media);
    return (
      <div className="h-64">
        <Line
          data={{
            labels: grupos.map(g => g.label),
            datasets: [{
              label: 'UV médio',
              data: uvValues,
              borderColor: '#f97316',
              backgroundColor: 'rgba(249, 115, 22, 0.08)',
              tension: 0.4,
              fill: true,
              pointBackgroundColor: uvValues.map(v =>
                v >= 11 ? '#7c3aed' : v >= 8 ? '#dc2626' : v >= 6 ? '#ea580c' : v >= 3 ? '#ca8a04' : '#16a34a'
              ),
              pointRadius: 5,
            }],
          }}
          options={{
            ...BASE_OPTIONS,
            scales: {
              ...BASE_OPTIONS.scales,
              y: {
                ...BASE_OPTIONS.scales.y,
                beginAtZero: true,
                max: Math.max(12, ...uvValues) + 1,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1a1a1a',
                padding: 12,
                bodyFont: { size: 13, weight: 'bold' as const },
                callbacks: {
                  label: (ctx: any) => {
                    const v = ctx.raw as number;
                    const nivel = v >= 11 ? 'Extremo' : v >= 8 ? 'Muito Alto' : v >= 6 ? 'Alto' : v >= 3 ? 'Moderado' : 'Baixo';
                    return ` UV ${v.toFixed(1)} — ${nivel} (média do mês)`;
                  },
                },
              },
            },
          }}
        />
      </div>
    );
  }

  const dailyLabels = dados.map(d =>
    new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  );
  const uvValues = dados.map(d => d.uv_index ?? 0);
  return (
    <div className="h-64">
      <Line
        data={{
          labels: dailyLabels,
          datasets: [{
            label: 'Índice UV',
            data: uvValues,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.08)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: uvValues.map(v =>
              v >= 11 ? '#7c3aed' : v >= 8 ? '#dc2626' : v >= 6 ? '#ea580c' : v >= 3 ? '#ca8a04' : '#16a34a'
            ),
            pointRadius: 4,
          }],
        }}
        options={{
          ...BASE_OPTIONS,
          scales: {
            ...BASE_OPTIONS.scales,
            y: { ...BASE_OPTIONS.scales.y, beginAtZero: true, max: Math.max(12, ...uvValues) + 1 },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1a1a1a',
              padding: 12,
              bodyFont: { size: 13, weight: 'bold' as const },
              callbacks: {
                label: (ctx: any) => {
                  const v = ctx.raw as number;
                  const nivel = v >= 11 ? 'Extremo' : v >= 8 ? 'Muito Alto' : v >= 6 ? 'Alto' : v >= 3 ? 'Moderado' : 'Baixo';
                  return ` UV ${v.toFixed(1)} — ${nivel}`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}
