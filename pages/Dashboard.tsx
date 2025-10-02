
import React, { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import Select from '../components/ui/Select';
import type { Order, Settlement, Client } from '../types';
import { OrderItemType } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  orders: Order[];
  settlements: Settlement[];
  clients: Client[];
}

const COLORS = {
  [OrderItemType.CAPEX]: '#0088FE',
  [OrderItemType.OPEX]: '#00C49F',
  [OrderItemType.CONSULTATIONS]: '#FFBB28',
};

const MONTHS = [
    { value: 1, label: 'Styczeń' }, { value: 2, label: 'Luty' }, { value: 3, label: 'Marzec' },
    { value: 4, label: 'Kwiecień' }, { value: 5, label: 'Maj' }, { value: 6, label: 'Czerwiec' },
    { value: 7, label: 'Lipiec' }, { value: 8, label: 'Sierpień' }, { value: 9, label: 'Wrzesień' },
    { value: 10, label: 'Październik' }, { value: 11, label: 'Listopad' }, { value: 12, label: 'Grudzień' },
];

const Dashboard: React.FC<DashboardProps> = ({ orders, settlements, clients }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 1-12 for months, 0 for "All Year"
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateDarkMode = () => {
      if (theme === 'system') {
        setIsDarkMode(darkModeMediaQuery.matches);
      } else {
        setIsDarkMode(theme === 'dark');
      }
    };
    updateDarkMode();
    darkModeMediaQuery.addEventListener('change', updateDarkMode);
    return () => darkModeMediaQuery.removeEventListener('change', updateDarkMode);
  }, [theme]);

  const availableYears = useMemo(() => {
    const years = new Set(settlements.map(s => s.year));
    if (!years.has(new Date().getFullYear())) {
        years.add(new Date().getFullYear());
    }
    // FIX: Using spread syntax to create an array from the Set. This is a common pattern and
    // helps TypeScript correctly infer the array type as number[], resolving the sort error.
    return [...years].sort((a, b) => b - a);
  }, [settlements]);

  const dashboardData = useMemo(() => {
    const filteredSettlementItems = settlements
      .filter(s => s.year === selectedYear && (selectedMonth === 0 || s.month === selectedMonth))
      .flatMap(s => s.items);

    const totalHoursWorkedInPeriod = filteredSettlementItems.reduce((sum, item) => sum + item.hours, 0);
    const settledOrdersInPeriodIds = new Set(filteredSettlementItems.map(item => item.orderId));
    
    // FIX: Add explicit type for accumulator 'acc' to ensure workTypeDistributionInPeriod is correctly typed.
    // This resolves a downstream type inference issue for `value`.
    const workTypeDistributionInPeriod = filteredSettlementItems.reduce((acc: Record<OrderItemType, number>, item) => {
      acc[item.itemType] = (acc[item.itemType] || 0) + item.hours;
      return acc;
    }, {} as Record<OrderItemType, number>);

    const pieChartData = Object.entries(workTypeDistributionInPeriod).map(([name, value]) => ({
      name: name as OrderItemType,
      value: parseFloat(value.toFixed(2)),
    }));

    const progressDetails = Array.from(settledOrdersInPeriodIds).map(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return null;
      
      const clientName = clients.find(c => c.id === order.clientId)?.name || 'N/A';

      const items = order.items.map(orderItem => {
        const limitHours = orderItem.hours;

        const usedHoursInPeriod = filteredSettlementItems
            .filter(item => item.orderId === order.id && item.itemType === orderItem.type)
            .reduce((sum, item) => sum + item.hours, 0);
        
        if(usedHoursInPeriod === 0) return null;

        const usedHoursTotal = settlements
            .flatMap(s => s.items)
            .filter(item => item.orderId === order.id && item.itemType === orderItem.type)
            .reduce((sum, item) => sum + item.hours, 0);

        const remainingHours = limitHours - usedHoursTotal;
        const progress = limitHours > 0 ? (usedHoursTotal / limitHours) * 100 : 0;

        return {
          itemType: orderItem.type,
          limitHours,
          usedHoursInPeriod,
          usedHoursTotal,
          remainingHours,
          progress: Math.min(100, progress),
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      if (items.length === 0) return null;

      return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          clientName,
          items,
      };
    }).filter((order): order is NonNullable<typeof order> => order !== null);

    return {
      totalHoursWorkedInPeriod,
      settledOrdersCount: settledOrdersInPeriodIds.size,
      pieChartData,
      progressDetails,
    };
  }, [selectedYear, selectedMonth, orders, settlements, clients]);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-3xl font-bold text-primary dark:text-white">Dashboard</h1>
            <div className="flex items-center gap-2">
                <Select className="w-28" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </Select>
                <Select className="w-48" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                    <option value={0}>Cały Rok</option>
                    {MONTHS.map(month => <option key={month.value} value={month.value}>{month.label}</option>)}
                </Select>
            </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
            <CardHeader><CardTitle>Przepracowane Godziny</CardTitle><CardDescription>w wybranym okresie</CardDescription></CardHeader>
            <CardContent><p className="text-4xl font-bold">{dashboardData.totalHoursWorkedInPeriod.toFixed(2)}</p></CardContent>
        </Card>
         <Card>
            <CardHeader><CardTitle>Rozliczane Zamówienia</CardTitle><CardDescription>w wybranym okresie</CardDescription></CardHeader>
            <CardContent><p className="text-4xl font-bold">{dashboardData.settledOrdersCount}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Podział Pracy</CardTitle><CardDescription>w wybranym okresie</CardDescription></CardHeader>
            <CardContent className="pt-0">
                 {dashboardData.pieChartData.length > 0 ? (
                  <div style={{ width: '100%', height: 120 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={dashboardData.pieChartData} innerRadius={30} outerRadius={50} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">
                                {dashboardData.pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={isDarkMode ? { backgroundColor: 'rgb(31 41 55)', border: '1px solid rgb(55 65 81)', borderRadius: '0.5rem' } : {}}
                                labelStyle={isDarkMode ? { color: '#f9fafb' } : {}}
                                itemStyle={isDarkMode ? { color: '#f9fafb' } : {}}
                                formatter={(value: number, name: OrderItemType) => [`${(value as number).toFixed(2)} godz.`, name]}
                             />
                            <Legend
                                layout="vertical" align="right" verticalAlign="middle"
                                wrapperStyle={isDarkMode ? { color: '#d1d5db' } : {}}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : ( <div className="flex items-center justify-center h-[120px] text-muted-foreground">Brak danych</div> )}
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
            <CardHeader>
              <CardTitle>Szczegółowy Postęp w Zamówieniach</CardTitle>
              <CardDescription>Wykorzystanie godzin w pozycjach zamówień, które były rozliczane w wybranym okresie.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Klient / Zamówienie</TableHead>
                    <TableHead>Typ Pracy</TableHead>
                    <TableHead className="text-right">Godziny (w okresie)</TableHead>
                    <TableHead className="text-right">Wykorzystano / Limit</TableHead>
                    <TableHead className="w-[200px]">Postęp Ogólny</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.progressDetails.length > 0 ? dashboardData.progressDetails.map(order => (
                    <React.Fragment key={order.orderId}>
                        {order.items.map((item, index) => (
                             <TableRow key={`${order.orderId}-${item.itemType}`}>
                                {index === 0 ? (
                                    <TableCell rowSpan={order.items.length} className="align-top font-medium">
                                        {order.clientName}
                                        <div className="text-sm font-normal text-muted-foreground">{order.orderNumber}</div>
                                    </TableCell>
                                ) : null}
                                <TableCell>{item.itemType}</TableCell>
                                <TableCell className="text-right font-semibold">{item.usedHoursInPeriod.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.usedHoursTotal.toFixed(2)} / {item.limitHours.toFixed(2)}</TableCell>
                                <TableCell>
                                    <div className="w-full bg-gray-200 rounded-full h-5 dark:bg-gray-700 relative">
                                        <div className="bg-blue-600 h-5 rounded-full" style={{ width: `${item.progress}%` }}></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className={`text-xs font-bold ${item.progress > 40 ? 'text-white' : 'text-primary dark:text-gray-200'}`}>{item.progress.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center mt-1">Pozostało: {item.remainingHours.toFixed(2)} h</div>
                                </TableCell>
                             </TableRow>
                        ))}
                    </React.Fragment>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground h-24">Brak rozliczeń w wybranym okresie.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;