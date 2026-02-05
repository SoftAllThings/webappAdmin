import React from "react";
import styles from "./AnalyticsSection.module.css";

type Props = {
  handleMetricChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleFromDate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToDate: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const DataSelection = ({
  handleMetricChange,
  handleFromDate,
  handleToDate,
}: Props) => {
  return (
    <div className={styles["metricsSection"]}>
      <div className={styles["fieldGroup"]}>
        <label htmlFor="metrics" className={styles["label"]}>
          Metric
        </label>
        <select
          name="metrics"
          id="metrics"
          className={styles["select"]}
          onChange={(e) => handleMetricChange(e)}
        >
          <option value="newUsers">New Daily Users</option>
          <option value="dailyActiveUsers">Daily Active Users</option>
          <option value="dailyPosts">Daily Posts</option>
        </select>
      </div>

      <div className={styles["dateGroup"]}>
        <div className={styles["fieldGroup"]}>
          <label htmlFor="from" className={styles["label"]}>
            From
          </label>
          <input
            onChange={(e) => handleFromDate(e)}
            id="from"
            name="from"
            type="date"
            className={styles["input"]}
          />
        </div>

        <div className={styles["fieldGroup"]}>
          <label htmlFor="to" className={styles["label"]}>
            To
          </label>
          <input
            onChange={(e) => handleToDate(e)}
            id="to"
            name="to"
            type="date"
            className={styles["input"]}
          />
        </div>
      </div>
    </div>
  );
};

export default DataSelection;
