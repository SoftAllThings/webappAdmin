import React, { useState } from "react";
import {
  fetchAnalytics,
  fetchUniqueUsersCount,
  fetchUsersWithEmailCount,
} from "../../services/api.analytics";
import type { Metric, AnalyticsResponse } from "../../services/api.analytics";
import DataSelection from "./DataSelection";
import { userExportApiService } from "../../services/userExportApiService";
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
import { CircularProgress } from "@mui/material";

const AnalyticsSection = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [metric, setMetric] = useState<Metric>('users');
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [metricText, setMetricText] = useState<string | undefined>("New Daily Users");
  const [incorrectDateWarning, setIncorrectDateWarning] = useState<string>('');
  const [uniqueUsers, setUniqueUsers] = useState<number | null>(null);
  const [uniqueUsersLoading, setUniqueUsersLoading] = useState(false);
  const [usersWithEmail, setUsersWithEmail] = useState<number | null>(null);
  const [usersWithEmailLoading, setUsersWithEmailLoading] = useState(false);
  const [exportPremium, setExportPremium] = useState<string>("all");
  const [exportFrom, setExportFrom] = useState<string>("");
  const [exportTo, setExportTo] = useState<string>("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string>("");
  const [exportSuccess, setExportSuccess] = useState<string>("");

  const handleFetchUniqueUsers = async () => {
    setUniqueUsersLoading(true);
    try {
      const count = await fetchUniqueUsersCount();
      setUniqueUsers(count);
    } finally {
      setUniqueUsersLoading(false);
    }
  };

  const handleFetchUsersWithEmail = async () => {
    setUsersWithEmailLoading(true);
    try {
      const count = await fetchUsersWithEmailCount();
      setUsersWithEmail(count);
    } finally {
      setUsersWithEmailLoading(false);
    }
  };

  const handleClick = () => {

    if (!metric || !from || !to) {
  setIncorrectDateWarning("Please select metric and dates");
  return;
}   
    setIsLoading(true);
    const fromDate = new Date(from);
    const toDate = new Date(to);

     const fetch = async () => {
      const response = await fetchAnalytics(metric, from, to);
      setAnalytics(response);
    setIsLoading(false)
    };
   

    if (toDate < fromDate) {setIncorrectDateWarning('Incorrect dates!'); setAnalytics(null)}
      else fetch();


      
  };


  const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetric(e.target.value as typeof metric);
    setIsLoading(false);
    setAnalytics(null)
    setMetricText(e.target.options[e.target.selectedIndex]?.text);
  };

  const handleFromDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrom(e.target.value);
  };

  const handleToDate = (e: React.ChangeEvent<HTMLInputElement>) => {


    setTo(e.target.value)
};

  const handleExportUsers = async () => {
    setExportError("");
    setExportSuccess("");

    if (exportFrom && exportTo && exportTo < exportFrom) {
      setExportError("Export dates are invalid.");
      return;
    }

    setExportLoading(true);

    try {
      const filters: {
        premium?: boolean;
        createdAtFrom?: string;
        createdAtTo?: string;
      } = {};

      if (exportPremium !== "all") {
        filters.premium = exportPremium === "true";
      }

      if (exportFrom) {
        filters.createdAtFrom = exportFrom;
      }

      if (exportTo) {
        filters.createdAtTo = exportTo;
      }

      const blob = await userExportApiService.exportUsersCsv({ filters });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateSuffix = new Date().toISOString().slice(0, 10);

      link.href = downloadUrl;
      link.download = `users-export-${dateSuffix}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setExportSuccess("CSV downloaded successfully.");
    } catch (error) {
      console.error("Failed to export users CSV:", error);
      setExportError(
        error instanceof Error ? error.message : "Failed to export users CSV."
      );
    } finally {
      setExportLoading(false);
    }
  };



  return (
    <div className={styles["mainCard"]}>
      <div className={styles["metricRow"]} style={{ marginBottom: "1rem" }}>
        <div className={styles["metricOutput"]}>
          Total User Docs (DB):&nbsp;
          <strong>{uniqueUsers !== null ? uniqueUsers : "—"}</strong>
        </div>
        <button onClick={handleFetchUniqueUsers} className={styles["showDataBtn"]} disabled={uniqueUsersLoading}>
          {uniqueUsersLoading ? <CircularProgress size={14} /> : "Fetch"}
        </button>
        <div className={styles["metricOutput"]}>
          Users With Email:&nbsp;
          <strong>{usersWithEmail !== null ? usersWithEmail : "—"}</strong>
        </div>
        <button
          onClick={handleFetchUsersWithEmail}
          className={styles["showDataBtn"]}
          disabled={usersWithEmailLoading}
        >
          {usersWithEmailLoading ? <CircularProgress size={14} /> : "Fetch"}
        </button>
      </div>

      <DataSelection
        handleMetricChange={handleMetricChange}
        handleFromDate={handleFromDate}
        handleToDate={handleToDate}
      />

      <button onClick={handleClick} className={styles["showDataBtn"]}>
        Show Data
      </button>


      {(!isLoading && analytics?.data.length === 0) && <strong className={styles['errorMessage']}>NO DATA FOUND!</strong>
      }

        {isLoading && <div className={styles['loadingSection']}><CircularProgress size={40}/></div> }

      {incorrectDateWarning ? (
        <div className={styles['errorMessage']}>{incorrectDateWarning}</div>
      ) : null}
      {analytics && <strong>{metricText}</strong>}
      <div className={styles['metricRow']}>
      {(analytics?.total) && <div className={styles["metricOutput"]}>Total: <strong>{analytics.total}</strong></div>}
      {analytics?.average && <div className={styles["metricOutput"]}>Daily Average: <strong>{Math.round(analytics.average)}</strong></div>}
      {analytics?.max && <div className={styles["metricOutput"]}>Max: <strong>{analytics.max}</strong></div>}
      {analytics?.min && <div className={styles["metricOutput"]}>Min: <strong>{analytics.min}</strong></div>}
      </div>
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

      <div className={styles["exportCard"]}>
        <div className={styles["exportHeader"]}>
          <strong>User Export</strong>
          <span className={styles["exportSubtext"]}>
            Download emails with optional filters and created date.
          </span>
        </div>

        <div className={styles["metricsSection"]}>
          <div className={styles["fieldGroup"]}>
            <label htmlFor="export-premium" className={styles["label"]}>
              Premium
            </label>
            <select
              id="export-premium"
              className={styles["select"]}
              value={exportPremium}
              onChange={(e) => setExportPremium(e.target.value)}
            >
              <option value="all">All users</option>
              <option value="true">Premium true</option>
              <option value="false">Premium false</option>
            </select>
          </div>

          <div className={styles["dateGroup"]}>
            <div className={styles["fieldGroup"]}>
              <label htmlFor="export-from" className={styles["label"]}>
                Created From
              </label>
              <input
                id="export-from"
                type="date"
                className={styles["input"]}
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
              />
            </div>

            <div className={styles["fieldGroup"]}>
              <label htmlFor="export-to" className={styles["label"]}>
                Created To
              </label>
              <input
                id="export-to"
                type="date"
                className={styles["input"]}
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
              />
            </div>
          </div>

        </div>

        <div className={styles["exportActions"]}>
          <button
            onClick={handleExportUsers}
            className={styles["showDataBtn"]}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <span className={styles["buttonLoadingContent"]}>
                <CircularProgress size={18} color="inherit" />
                Preparing CSV...
              </span>
            ) : (
              "Export CSV"
            )}
          </button>

          {exportError ? (
            <div className={styles["errorMessage"]}>{exportError}</div>
          ) : null}

          {exportSuccess ? (
            <div className={styles["successMessage"]}>{exportSuccess}</div>
          ) : null}
        </div>

        {exportLoading ? (
          <div className={styles["exportLoadingPanel"]}>
            <CircularProgress size={26} />
            <div className={styles["exportLoadingText"]}>
              <strong>Generating your export...</strong>
              <span>
                Large exports can take a while for 25k users. Please keep this
                window open until the download starts.
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AnalyticsSection;
