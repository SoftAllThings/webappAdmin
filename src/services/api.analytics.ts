export type Metric = 'newUsers' | 'dailyActiveUsers' | 'dailyPosts';

export type AnalyticsPoint = {
  date: string;
  value: number;
}

export type AnalyticsResponse = {
  metric: Metric;
  from: string;
  to: string;
  total: number;
  data: AnalyticsPoint[]
}

export async function fetchAnalytics(
  metric: Metric,
  from: string,
  to: string
){
 
    const response = await fetch(
      `http://localhost:3001/api/analytics?metric=${metric}&from=${from}&to=${to}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch analytics')
    }

    const json = await response.json();

    return json.data;
  
}

