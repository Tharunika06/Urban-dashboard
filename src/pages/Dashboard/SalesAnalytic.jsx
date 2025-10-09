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

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sept","Oct","Nov","Dec"
];
const MONTH_SHORT = MONTH_NAMES.map(m => m.slice(0,3).toLowerCase());

const yAxisTickFormatter = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(0)}`;
  }
};

const toFullMonthName = (raw) => {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number" || (/^\d+$/.test(String(raw).trim()))) {
    const idx = Number(raw) - 1;
    if (idx >= 0 && idx < 12) return MONTH_NAMES[idx];
    return null;
  }
  const s = String(raw).trim().toLowerCase();
  const full = MONTH_NAMES.find(m => m.toLowerCase() === s);
  if (full) return full;
  const shortIdx = MONTH_SHORT.indexOf(s.length >= 3 ? s.slice(0,3) : s);
  if (shortIdx !== -1) return MONTH_NAMES[shortIdx];
  return null;
};

const SalesAnalytic = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("All");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get("/sales/monthly");

        const formattedData = res.data.map((item) => {
          let name = item.month;
          const full = toFullMonthName(name);
          if (full) name = full;
          name = String(name).trim();

          const earnings = parseFloat(item.earnings) || 0;
          return { name, earnings };
        });

        const validData = formattedData.filter(item => 
          item.name && !isNaN(item.earnings)
        );

        setData(validData);

        const totalEarnings = validData.reduce((sum, it) => sum + it.earnings, 0);
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
    setSelectedMonth(monthValue || "All");

    if (!monthValue || String(monthValue).toLowerCase() === "all") {
      const yearlyTotal = data.reduce((sum, item) => sum + item.earnings, 0);
      setTotal(yearlyTotal);
      return;
    }

    const monthFull = toFullMonthName(monthValue);
    let monthData = null;
    if (monthFull) {
      monthData = data.find(d => String(d.name).toLowerCase() === monthFull.toLowerCase());
    } else {
      const s = String(monthValue).trim().toLowerCase();
      monthData = data.find(d => String(d.name).trim().toLowerCase() === s);
    }

    if (monthData) {
      setTotal(monthData.earnings);
    } else {
      setTotal(0);
    }
  };

  const getYAxisDomain = () => {
    if (!data.length) return [0, 100];
    
    const maxValue = Math.max(...data.map(d => d.earnings));
    const minValue = Math.min(...data.map(d => d.earnings));
    
    const padding = (maxValue - minValue) * 0.1 || maxValue * 0.1 || 10;
    
    return [
      Math.max(0, minValue - padding),
      maxValue + padding
    ];
  };

  const renderCustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;

    const sel = selectedMonth && String(selectedMonth).toLowerCase();
    const payloadName = String(payload?.name || "").trim().toLowerCase();

    const selFull = toFullMonthName(selectedMonth);
    const selCompare = selFull ? selFull.toLowerCase() : sel;

    if (selectedMonth && selectedMonth !== "All" && payloadName === selCompare) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={7}
          stroke="#ff4d4f"
          strokeWidth={2.5}
          fill="#fff"
        />
      );
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        stroke="var(--chart-line-1)"
        strokeWidth={2}
        fill="#fff"
      />
    );
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

      <div style={{ width: "100%", height: 300 }}>
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
              tickFormatter={yAxisTickFormatter}
              domain={getYAxisDomain()}
            />
            <Tooltip
              formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Earnings']}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="var(--chart-line-1)"
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