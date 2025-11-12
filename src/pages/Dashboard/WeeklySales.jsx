// WeeklySales.jsx - UPDATED
// ============================================
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

      // ✅ FIXED: Use /api/sales/weekly (with /api prefix)
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
        <div style={{ textAlign: "center", padding: "40px" }}>
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
        <div
          style={{
            color: "red",
            fontSize: "14px",
            padding: "8px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "20px"
      }}>
        <button
          onClick={goToPreviousWeek}
          style={{
            background: "#E6E8F0",
            border: "none",
            color: "black",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseOver={(e) => e.target.style.opacity = "0.8"}
          onMouseOut={(e) => e.target.style.opacity = "1"}
        >
          &lt;
        </button>
        
        <span 
          className="card-subtitle" 
          style={{ 
            minWidth: "120px", 
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "600"
          }}
        >
          {getWeekLabel(weekOffset)}
        </span>
        
        <button
          onClick={goToNextWeek}
          style={{
            background: "#E6E8F0",
            border: "none",
            color: "black",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onMouseOver={(e) => e.target.style.opacity = "0.8"}
          onMouseOut={(e) => e.target.style.opacity = "1"}
        >
          &gt;
        </button>
      </div>
      <br />

      <div style={{ width: "100%", height: 200 }}>
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