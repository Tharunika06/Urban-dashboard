// SalesAnalytic.jsx
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../utils/api";
import MonthDropdown from "../../components/common/MonthDropdown";
import { 
  MONTHS_FULL,
  MONTHS_SHORT,
  toFullMonthName, 
  formatters,
  CHART_COLORS,
  DEFAULTS 
} from "../../utils/constants"
import { 
  getYAxisDomain, 
  createCustomDotRenderer,
  calculateTotal,
  getMonthData
} from "../../utils/chartUtils";
import { formatSalesData } from "../../utils/dataUtils";
import "../../styles/SalesAnalytic.css";

const SalesAnalytic = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.MONTH);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get("/api/sales/monthly");
        
        // Convert full month names to short names
        const formattedData = formatSalesData(res.data, toFullMonthName).map(item => {
          const monthIndex = MONTHS_FULL.indexOf(item.name);
          return {
            ...item,
            name: monthIndex !== -1 ? MONTHS_SHORT[monthIndex] : item.name
          };
        });
        
        setData(formattedData);
        const totalEarnings = calculateTotal(formattedData, 'earnings');
        setTotal(totalEarnings);
      } catch (err) {
        console.error("Error fetching sales analytics:", err);
        setData([]);
        setTotal(0);
      }
    };

    fetchSales();
  }, []);

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue || DEFAULTS.MONTH);

    if (!monthValue || String(monthValue).toLowerCase() === 'all') {
      const yearlyTotal = calculateTotal(data, 'earnings');
      setTotal(yearlyTotal);
      return;
    }

    const monthData = getMonthData(data, monthValue, toFullMonthName);
    setTotal(monthData ? monthData.earnings : 0);
  };

  const renderCustomDot = createCustomDotRenderer(
    selectedMonth,
    toFullMonthName,
    CHART_COLORS.HIGHLIGHT,
    'var(--chart-line-1)',
    DEFAULTS.MONTH
  );

  // Custom tooltip to fix the [object Object] issue
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="sales-tooltip">
          <p className="sales-tooltip-label">{label}</p>
          <p className="sales-tooltip-value">
            Earnings: ${payload[0].value.toLocaleString("en-US")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card sales-analytic-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <h3 className="card-title">Sales Analytic</h3>
          <br />
          <p className="card-subtitle mb-0">
            Earnings: <strong>{`$${total.toLocaleString("en-US")}`}</strong>
          </p>
        </div>
        <MonthDropdown onChange={handleMonthChange} />
      </div>

      <div className="sales-chart-container">
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 25, bottom: 20 }}
          >
            <XAxis 
              dataKey="name" 
              axisLine 
              tickLine 
              textAnchor="end"
              height={60}
            />
            <YAxis
              axisLine
              tickLine
              tickFormatter={formatters.currency}
              domain={getYAxisDomain(data, 'earnings')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke={CHART_COLORS.PRIMARY}
              strokeWidth={3}
              dot={renderCustomDot}
              activeDot={renderCustomDot}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesAnalytic;