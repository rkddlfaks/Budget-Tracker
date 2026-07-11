import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, isSameDay, isSameMonth, isSameYear, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { translations } from '../i18n';

const Stats = () => {
  const { transactions, budgetSettings, language } = useBudget();
  const [period, setPeriod] = useState('monthly');
  const [dailyDate, setDailyDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weekStart, setWeekStart] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weekEnd, setWeekEnd] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [monthDate, setMonthDate] = useState(format(new Date(), 'yyyy-MM'));
  const [yearDate, setYearDate] = useState(format(new Date(), 'yyyy'));
  const t = translations[language];

  const filteredTransactions = transactions.filter(t => {
    const date = parseISO(t.date);
    if (period === 'daily') return isSameDay(date, parseISO(dailyDate));
    if (period === 'weekly') {
      try {
        const start = startOfDay(parseISO(weekStart));
        const end = endOfDay(parseISO(weekEnd));
        return isWithinInterval(date, { start, end });
      } catch (e) {
        return true;
      }
    }
    if (period === 'monthly') return isSameMonth(date, parseISO(`${monthDate}-01`));
    if (period === 'yearly') return isSameYear(date, parseISO(`${yearDate}-01-01`));
    return true;
  });

  // Calculate totals for period
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Budget proportions logic
  const targetNeeds = (totalIncome * budgetSettings.needs) / 100;
  const targetWants = (totalIncome * budgetSettings.wants) / 100;
  const targetSavings = (totalIncome * budgetSettings.savings) / 100;

  // Let's assume expenses are loosely categorized if we don't strictly enforce categories, 
  // but for the chart, we'll just show Income vs Expense vs target Savings
  const pieData = [
    { name: 'Expenses', value: totalExpense, color: 'var(--accent-expense)' },
    { name: 'Remaining/Savings', value: Math.max(0, totalIncome - totalExpense), color: 'var(--primary-color)' }
  ];

  // Group by category for bar chart (Expenses only)
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.title] = (acc[t.title] || 0) + Number(t.amount);
      return acc;
    }, {});
    
  const barData = Object.keys(expensesByCategory).map(key => ({
    name: key.length > 10 ? key.substring(0, 10) + '...' : key,
    amount: expensesByCategory[key]
  })).sort((a, b) => b.amount - a.amount).slice(0, 5); // top 5

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      alert('No data to export for this period.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(18);
    doc.text(`Budget Report (${period.charAt(0).toUpperCase() + period.slice(1)})`, pageWidth / 2, 20, { align: 'center' });
    
    // Summary
    doc.setFontSize(12);
    doc.text('Summary:', 14, 35);
    doc.setFontSize(10);
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, 42);
    doc.text(`Total Expense: ${formatCurrency(totalExpense)}`, 14, 48);
    doc.text(`Remaining Balance: ${formatCurrency(totalIncome - totalExpense)}`, 14, 54);

    // Detail Table
    const tableColumn = ["Date", "Type", "Category/Source", "Amount"];
    const tableRows = [];

    filteredTransactions.forEach(t => {
      const transactionData = [
        new Date(t.date).toLocaleDateString(),
        t.type === 'income' ? 'Income' : 'Expense',
        t.title,
        formatCurrency(t.amount)
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 65,
      theme: 'striped',
      headStyles: { fillColor: [255, 182, 193] }, // Soft pink header for PDF
      styles: { fontSize: 10 }
    });

    doc.save(`budget_report_${period}_${new Date().getTime()}.pdf`);
  };

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('No data to export for this period.');
      return;
    }
    
    // Create CSV content
    const headers = ['Date', 'Type', 'Category/Source', 'Amount (IDR)'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type,
      `"${t.title}"`,
      t.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `budget_report_${period}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-primary-color">{t.stats}</h1>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="btn btn-outline" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.25rem' }}
          >
            <Download size={14} />
            CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="btn btn-primary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', gap: '0.25rem' }}
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>
      
      {/* Period Selector */}
      <div className="flex gap-1 mb-4 p-1 shadow-sm" style={{ backgroundColor: 'var(--surface-color)', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
          <button 
            key={p}
            className="w-full"
            style={{ 
              padding: '0.6rem 0', 
              fontSize: '0.75rem', 
              fontWeight: period === p ? '600' : '500',
              border: 'none', 
              borderRadius: '9999px',
              backgroundColor: period === p ? 'var(--primary-color)' : 'transparent', 
              color: period === p ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setPeriod(p)}
          >
            {t[p]}
          </button>
        ))}
      </div>

      {/* Date Picker */}
      <div className="flex flex-col gap-3 mb-8 p-4 shadow-sm" style={{ backgroundColor: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <span className="text-sm font-medium">{t.selectDate}</span>
        
        {period === 'daily' && (
          <input 
            type="date"
            className="input-field"
            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-color)' }}
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
          />
        )}

        {period === 'weekly' && (
          <div className="flex items-center gap-2">
            <input 
              type="date"
              className="input-field"
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-color)' }}
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            />
            <span className="text-secondary">-</span>
            <input 
              type="date"
              className="input-field"
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-color)' }}
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
            />
          </div>
        )}

        {period === 'monthly' && (
          <input 
            type="month"
            className="input-field"
            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-color)' }}
            value={monthDate}
            onChange={(e) => setMonthDate(e.target.value)}
          />
        )}

        {period === 'yearly' && (
          <input 
            type="number"
            min="2000"
            max="2100"
            className="input-field"
            style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '12px', border: 'none', backgroundColor: 'var(--bg-color)' }}
            value={yearDate}
            onChange={(e) => setYearDate(e.target.value)}
          />
        )}
      </div>

      {/* Summary Cards */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="card w-full flex justify-between items-center">
          <p className="text-sm text-secondary">{t.income} ({t[period]})</p>
          <p className="font-bold text-income" style={{ fontSize: '1.2rem' }}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className="card w-full flex justify-between items-center">
          <p className="text-sm text-secondary">{t.expense} ({t[period]})</p>
          <p className="font-bold text-expense" style={{ fontSize: '1.2rem' }}>{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Proportions Chart */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4">{t.incomeAlloc}</h3>
        {totalIncome > 0 ? (
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-center text-secondary py-8">{t.noIncome}</p>
        )}
      </div>

      {/* Top Expenses */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4">{t.topExpenses}</h3>
        {barData.length > 0 ? (
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" tickFormatter={(value) => value/1000 + 'k'} stroke="var(--text-secondary)" />
                <YAxis dataKey="name" type="category" width={80} stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: 'var(--surface-color)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="amount" fill="var(--accent-expense)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-center text-secondary py-8">{t.noExpense}</p>
        )}
      </div>
    </div>
  );
};

export default Stats;
