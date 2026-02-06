export type RandomUserResponse = {
  id: string;
  [key: string]: unknown;
};

export async function fetchRandomUser(): Promise<RandomUserResponse> {
  const response = await fetch("http://localhost:3001/api/firebase/random-user");

  if (!response.ok) {
    throw new Error("Failed to fetch random user");
  }

  const json = await response.json();

  return json.data;
}
