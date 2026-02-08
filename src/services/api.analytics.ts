import axios from 'axios';


export type Metric = 'users' | 'poops';

export type AnalyticsPoint = {
  date: string;
  value: number;
}

export type AnalyticsResponse = {
  data: AnalyticsPoint[];
  total: number;
  average: number;
}

export async function fetchAnalytics(
  metric: Metric,
  from: string,
  to: string
): Promise<AnalyticsResponse>  {
 
    // const response = await fetch(
    //   `http://localhost:3001/api/analytics?metric=${metric}&from=${from}&to=${to}`
    // );

    // if (!response.ok) {
    //   throw new Error('Failed to fetch analytics')
    // }

    // const json = await response.json();


    //provato a fare con axios, mi piace di piu.
    const fetchedData = await axios.get(`http://localhost:3001/api/firebase/data`, 
      {params:{
        metric, from, to
    }})
    .then(response => response.data.data)
    .catch(error => {throw new Error('Failed to fetch analytics: ' + error.message)});

    return fetchedData;
  
}

