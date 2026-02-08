import React, { useState } from "react";
import { fetchAnalytics } from "../../services/api.analytics";
import type { Metric, AnalyticsResponse } from "../../services/api.analytics";
import DataSelection from "./DataSelection";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import styles from "./AnalyticsSection.module.css";

const AnalyticsSection = () => {
  const [metric, setMetric] = useState<Metric>('users');
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [metricText, setMetricText] = useState<string | undefined>("New Daily Users");
  const [incorrectDateWarning, setIncorrectDateWarning] = useState<string>('')


  const handleClick = () => {

    if (!metric || !from || !to) {
  setIncorrectDateWarning("Please select metric and dates");
  return;
}   
    const fromDate = new Date(from);
    const toDate = new Date(to);

     const fetch = async () => {
      const response = await fetchAnalytics(metric, from, to);
      setAnalytics(response);

    };
   

    if (toDate < fromDate) {setIncorrectDateWarning('Incorrect dates!'); setAnalytics(null)}
      else fetch();


      
  };


  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetric(e.target.value as typeof metric);
    setAnalytics(null)
    setMetricText(e.target.options[e.target.selectedIndex]?.text);
  };

  const handleFromDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrom(e.target.value);
  };

  const handleToDate = (e: React.ChangeEvent<HTMLInputElement>) => {


    setTo(e.target.value)
};

  


  return (
    <div className={styles["mainCard"]}>
      <DataSelection
        handleMetricChange={handleMetricChange}
        handleFromDate={handleFromDate}
        handleToDate={handleToDate}
      />

      <button onClick={handleClick} className={styles["showDataBtn"]}>
        Show Data
      </button>


      {(!analytics && !incorrectDateWarning) && (
        <strong className={styles['errorMessage']}>Data not loaded</strong>
      )}

      {incorrectDateWarning ? (
        <div className={styles['errorMessage']}>{incorrectDateWarning}</div>
      ) : null}
      {analytics && <strong>{metricText}</strong>}
      {analytics?.average && <div className={styles["averageOutput"]}>Daily Average: {Math.round(analytics.average)}</div>}

      {analytics && (
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={analytics.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" type="category" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className={styles["dataOuputCard"]}>
        <strong>Date</strong>
        <strong>Daily</strong>
      </div>
      {analytics?.data.map((data) => {
        return (
          <div className={styles["dataOuputCard"]}>
            <div className={styles["dataOutput"]}>{data.date}</div>
            <div className={styles["dataOutput"]}>{data.value}</div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsSection;
