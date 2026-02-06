import React, { useState } from "react";
import { fetchAnalytics } from "../../services/api.analytics";
import { fetchRandomUser } from "../../services/api.firebase";
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
  const [metric, setMetric] = useState<Metric>("newUsers");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [metricText, setMetricText] = useState<string | undefined>("New Daily Users");
  const [incorrectDateWarning, setIncorrectDateWarning] = useState<string>('')


  const handleClick = () => {
    const fetch = async () => {
      const response = await fetchAnalytics(metric, fromDate, toDate);
      setAnalytics(response);
    };

    
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (to < from) {setIncorrectDateWarning('Incorrect dates!'); setAnalytics(null)}
      else fetch();
  };

  const handleRandomUser = () => {
    const doFetch = async () => {
      try {
        const user = await fetchRandomUser();
        console.log("Random Firebase User:", user);
      } catch (error) {
        console.error("Error fetching random user:", error);
      }
    };
    doFetch();
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetric(e.target.value as typeof metric);
    setMetricText(e.target.options[e.target.selectedIndex]?.text);
  };

  const handleFromDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };

  const handleToDate = (e: React.ChangeEvent<HTMLInputElement>) => {


    setToDate(e.target.value)
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

      <button onClick={handleRandomUser} className={styles["showDataBtn"]}>
        Fetch Random User
      </button>

      {(!analytics && !incorrectDateWarning) && (
        <strong className={styles['errorMessage']}>Data not loaded</strong>
      )}

      {incorrectDateWarning ? (
        <div className={styles['errorMessage']}>{incorrectDateWarning}</div>
      ) : null}
      {analytics?.metric && <strong>{metricText}</strong>}
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
