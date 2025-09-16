import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const WeeklySales = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, +1 = next week

  // Fetch weekly sales (counts) from backend
  const fetchSalesData = async (offset = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `http://192.168.0.152:5000/api/sales/weekly?offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data = await response.json();

      // If backend returns an object instead of an array, normalize it
      if (!Array.isArray(data)) {
        data = Object.entries(data).map(([day, sales]) => ({
          day: day.charAt(0),
          sales,
        }));
      }

      setSalesData(data);

      // totalSales is now the **count** of properties sold across the week
      const total = data.reduce((sum, d) => sum + Number(d.sales || 0), 0);
      setTotalSales(total);
    } catch (err) {
      console.error("❌ Error fetching sales data:", err);
      setError("Failed to load sales data");

      // Fallback dummy data (counts)
      const fallback = [
        { day: "S", sales: 4 },
        { day: "M", sales: 6 },
        { day: "T", sales: 3 },
        { day: "W", sales: 2 },
        { day: "T", sales: 5 },
        { day: "F", sales: 7 },
        { day: "S", sales: 3 },
      ];
      setSalesData(fallback);
      setTotalSales(fallback.reduce((sum, d) => sum + d.sales, 0));
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when weekOffset changes
  useEffect(() => {
    fetchSalesData(weekOffset);
  }, [weekOffset]);

  // Function to get week label based on offset
  const getWeekLabel = (offset) => {
    if (offset === 0) return "This Week";
    if (offset === -1) return "Last Week";
    if (offset === 1) return "Next Week";
    if (offset < -1) return `${Math.abs(offset)} Weeks Ago`;
    if (offset > 1) return `${offset} Weeks Ahead`;
  };

  // Navigation handlers
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

  // Compute padded Y max so small bars are visible
  const maxCount = Math.max(...salesData.map((d) => Number(d.sales || 0)), 1);
  const paddedMax = Math.ceil(maxCount * 1.2); // 20% padding

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

      {/* Week Navigation Header */}
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
          className="card-title" 
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
            height: "30px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "12px",
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
              fill="var(--primary-blue)"
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