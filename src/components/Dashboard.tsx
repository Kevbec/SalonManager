import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { KPICard } from './KPICard';
import { PeriodSelector } from './PeriodSelector';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  startOfYear, endOfYear, eachMonthOfInterval, isSameMonth, isSameYear,
  isWithinInterval, subWeeks, subMonths, subYears, addDays
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { TimeRange, ComparisonPeriod } from '../types';

const CHART_COLOR = '#1e40af';

export function Dashboard() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [globalPeriod, setGlobalPeriod] = useState<ComparisonPeriod | 'global'>('month');

  const calculateKPIs = (period: ComparisonPeriod | 'global') => {
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;
    let currentEnd = now;
    let previousEnd: Date;

    if (period === 'global') {
      return {
        clients: {
          current: state.clients.length,
          previous: 0,
          percentageChange: 0,
          comparisonPeriod: period
        },
        revenue: {
          current: state.services.reduce((sum, service) => sum + service.price, 0),
          previous: 0,
          percentageChange: 0,
          comparisonPeriod: period
        },
        appointments: {
          current: state.services.length,
          previous: 0,
          percentageChange: 0,
          comparisonPeriod: period
        }
      };
    }

    switch (period) {
      case 'week':
        currentStart = startOfWeek(now, { weekStartsOn: 1 });
        previousStart = subWeeks(currentStart, 1);
        previousEnd = endOfWeek(previousStart);
        break;
      case 'month':
        currentStart = startOfMonth(now);
        previousStart = startOfMonth(subMonths(now, 1));
        previousEnd = endOfMonth(previousStart);
        break;
      case 'year':
        currentStart = startOfYear(now);
        previousStart = startOfYear(subYears(now, 1));
        previousEnd = endOfYear(previousStart);
        break;
    }

    currentStart.setHours(0, 0, 0, 0);
    currentEnd.setHours(23, 59, 59, 999);
    previousStart.setHours(0, 0, 0, 0);
    previousEnd.setHours(23, 59, 59, 999);

    const currentInterval = { start: currentStart, end: currentEnd };
    const previousInterval = { start: previousStart, end: previousEnd };

    const currentServices = state.services.filter(service => {
      const serviceDate = parseISO(service.date);
      return isWithinInterval(serviceDate, currentInterval);
    });

    const previousServices = state.services.filter(service => {
      const serviceDate = parseISO(service.date);
      return isWithinInterval(serviceDate, previousInterval);
    });

    const currentClients = new Set(currentServices.map(service => service.clientId)).size;
    const previousClients = new Set(previousServices.map(service => service.clientId)).size;

    const currentRevenue = currentServices.reduce((sum, service) => sum + service.price, 0);
    const previousRevenue = previousServices.reduce((sum, service) => sum + service.price, 0);

    const currentAppointments = currentServices.length;
    const previousAppointments = previousServices.length;

    return {
      clients: {
        current: currentClients,
        previous: previousClients,
        percentageChange: previousClients ? ((currentClients - previousClients) / previousClients) * 100 : 0,
        comparisonPeriod: period
      },
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        percentageChange: previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        comparisonPeriod: period
      },
      appointments: {
        current: currentAppointments,
        previous: previousAppointments,
        percentageChange: previousAppointments ? ((currentAppointments - previousAppointments) / previousAppointments) * 100 : 0,
        comparisonPeriod: period
      }
    };
  };

  const kpis = useMemo(() => calculateKPIs(globalPeriod), [state.services, state.clients, globalPeriod]);

  const chartData = useMemo(() => {
    const now = new Date();
    let formattedData = [];

    switch (timeRange) {
      case 'week': {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        
        formattedData = Array.from({ length: 7 }, (_, index) => {
          const date = addDays(weekStart, index);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayRevenue = state.services
            .filter(service => service.date.startsWith(dateStr))
            .reduce((sum, service) => sum + service.price, 0);

          return {
            date: dateStr,
            name: format(date, 'EEE', { locale: fr }),
            amount: dayRevenue
          };
        });
        break;
      }

      case 'month': {
        const monthStart = startOfMonth(now);
        const daysInMonth = endOfMonth(now).getDate();
        
        formattedData = Array.from({ length: daysInMonth }, (_, index) => {
          const date = addDays(monthStart, index);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          const dayRevenue = state.services
            .filter(service => service.date.startsWith(dateStr))
            .reduce((sum, service) => sum + service.price, 0);

          return {
            date: dateStr,
            name: format(date, 'd MMM', { locale: fr }),
            amount: dayRevenue
          };
        });
        break;
      }

      case 'year': {
        const yearStart = startOfYear(now);
        const months = eachMonthOfInterval({ start: yearStart, end: now });
        
        formattedData = months.map(month => {
          const monthRevenue = state.services
            .filter(service => {
              const serviceDate = parseISO(service.date);
              return isSameMonth(serviceDate, month) && isSameYear(serviceDate, month);
            })
            .reduce((sum, service) => sum + service.price, 0);

          return {
            name: format(month, 'MMM', { locale: fr }),
            amount: monthRevenue
          };
        });
        break;
      }

      case 'global': {
        const revenueByYear = state.services.reduce((acc, service) => {
          const year = parseISO(service.date).getFullYear();
          acc[year] = (acc[year] || 0) + service.price;
          return acc;
        }, {} as Record<number, number>);

        formattedData = Object.entries(revenueByYear)
          .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
          .map(([year, total]) => ({
            name: year,
            amount: total
          }));
        break;
      }
    }

    return formattedData;
  }, [state.services, timeRange]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tableau de bord</h2>
        <PeriodSelector value={globalPeriod} onChange={setGlobalPeriod} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          icon={Users}
          title="Clients Actifs"
          kpi={kpis.clients}
          format={val => val.toString()}
          comparisonPeriod={globalPeriod}
          onComparisonChange={setGlobalPeriod}
        />
        <KPICard
          icon={TrendingUp}
          title="Revenu"
          kpi={kpis.revenue}
          format={val => `${val.toLocaleString('fr-FR')} €`}
          comparisonPeriod={globalPeriod}
          onComparisonChange={setGlobalPeriod}
        />
        <KPICard
          icon={Calendar}
          title="Prestations"
          kpi={kpis.appointments}
          format={val => val.toString()}
          comparisonPeriod={globalPeriod}
          onComparisonChange={setGlobalPeriod}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Évolution du revenu</h2>
          <div className="flex space-x-2">
            {(['week', 'month', 'year', 'global'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  timeRange === range
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range === 'week' && 'Semaine'}
                {range === 'month' && 'Mois'}
                {range === 'year' && 'Année'}
                {range === 'global' && 'Global'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {timeRange === 'global' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'Revenu']}
                />
                <Bar dataKey="amount" fill={CHART_COLOR} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'Revenu']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={CHART_COLOR}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLOR }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}