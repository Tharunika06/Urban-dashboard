// WeeklySales.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import api from "../../utils/api";
import { getPaddedMaxValue, calculateTotal } from "../../utils/chartUtils";
import { formatWeeklySalesData, getWeeklySalesFallback } from "../../utils/dataUtils";
import { getWeekLabel } from "../../utils/dateUtils";
import "../../styles/WeeklySales.css";

const WeeklySales = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchSalesData = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/sales/weekly?offset=${offset}`);
      const formattedData = formatWeeklySalesData(response.data);

      setSalesData(formattedData);
      const total = calculateTotal(formattedData, 'sales');
      setTotalSales(total);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data");

      const fallback = getWeeklySalesFallback();
      setSalesData(fallback);
      setTotalSales(calculateTotal(fallback, 'sales'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(weekOffset);
  }, [weekOffset]);

  const goToPreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="card">
        <h3 className="card-title">Weekly Sales</h3>
        <div className="weekly-sales-loading">
          Loading sales data...
        </div>
      </div>
    );
  }

  const paddedMax = getPaddedMaxValue(salesData, 'sales');

  return (
    <div className="card">
      <h3 className="card-title">Weekly Sales</h3>
      <br />

      {error && (
        <div className="weekly-sales-error">
          {error}
        </div>
      )}

      <div className="weekly-sales-navigation">
        <button
          onClick={goToPreviousWeek}
          className="weekly-sales-nav-btn"
        >
          &lt;
        </button>
        
        <span className="weekly-sales-label">
          {getWeekLabel(weekOffset)}
        </span>
        
        <button
          onClick={goToNextWeek}
          className="weekly-sales-nav-btn"
        >
          &gt;
        </button>
      </div>
      <br />

      <div className="weekly-sales-chart-container">
        <ResponsiveContainer>
          <BarChart
            data={salesData}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
          >
            <XAxis dataKey="day" axisLine={true} tickLine={false} />
            <YAxis
              domain={[0, paddedMax]}
              axisLine={true}
              tickLine={true}
              tickCount={5}
            />
            <Bar
              dataKey="sales"
              fill="#0075FF"
              barSize={15}
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="total-sales-text">
          Total Property Sales: <strong>{totalSales}</strong>
        </p>
      </div>
    </div>
  );
};

export default WeeklySales;