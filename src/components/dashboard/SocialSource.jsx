import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "../../utils/api";
import MonthDropdown from "../../components/common/MonthDropdown";
import { PIE_CHART_COLORS, CHART_COLORS, DEFAULTS, API_ENDPOINTS } from "../../utils/constants";
import "../../styles/SocialSource.css";

const SocialSource = () => {
  const [buyersData, setBuyersData] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.MONTH);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyersData = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.BUYERS);
        console.log("Buyers data response:", response.data);
        setBuyersData(response.data);
      } catch (error) {
        console.error("Error fetching buyers data:", error);
        // Set empty data on error to prevent crashes
        setBuyersData({});
      } finally {
        setLoading(false);
      }
    };

    fetchBuyersData();
  }, []);

  if (loading) {
    return <div className="card text-center p-3">Loading buyers data...</div>;
  }

  // Calculate total value based on selected month
  const totalValue = selectedMonth === DEFAULTS.MONTH
    ? Object.values(buyersData).reduce((sum, count) => sum + count, 0)
    : (buyersData[selectedMonth] || 0);

  const hasData = totalValue > 0;

  const chartData = hasData
    ? [
        { name: "Buyers", value: 0.75 * totalValue },
        { name: "Remaining", value: 0.25 * totalValue },
      ]
    : [{ name: "No Data", value: 100 }];

  return (
    <div className="card text-center">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="card-title">Social Source</h3>
        <MonthDropdown 
          onChange={(month) => setSelectedMonth(month)}
          defaultValue={DEFAULTS.MONTH}
        />
      </div>
      <span className="social-source-subtitle">
        Total traffic in <strong>{selectedMonth === DEFAULTS.MONTH ? "All Months" : selectedMonth}</strong>
      </span>
      <div className="social-source-chart-wrapper">
        <div className="social-source-chart-inner">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {hasData && (
                <defs>
                  <linearGradient id="gradientColor" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.GRADIENT_START} />
                    <stop offset="100%" stopColor={CHART_COLORS.GRADIENT_END} />
                  </linearGradient>
                </defs>
              )}
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={450}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={hasData ? PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] : CHART_COLORS.EMPTY}
                    stroke={hasData ? PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] : CHART_COLORS.EMPTY}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="social-source-center-text">
            <div className="social-source-label">
              Total Buyers
            </div>
            <div className={`social-source-value ${hasData ? 'has-data' : 'no-data'}`}>
              {totalValue}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSource;