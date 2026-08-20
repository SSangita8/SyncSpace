import axios from "axios";

const API = axios.create({
  baseURL: "https://judge0-ce.p.rapidapi.com",
  headers: {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": import.meta.env.VITE_RAPIDAPI_KEY,
    "X-RapidAPI-Host": import.meta.env.VITE_RAPIDAPI_HOST,
  },
});

// =========================
// SUBMIT CODE
// =========================

export async function runCode(sourceCode, languageId) {
  try {
    // Submit code
    const submitResponse = await API.post(
      "/submissions?base64_encoded=false&wait=false",
      {
        source_code: sourceCode,
        language_id: languageId,
      },
    );

    const token = submitResponse.data.token;

    // Poll until execution finishes
    while (true) {
      const result = await API.get(
        `/submissions/${token}?base64_encoded=false`,
      );

      const statusId = result.data.status.id;

      // Queue or Processing
      if (statusId === 1 || statusId === 2) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      return result.data;
    }
  } catch (error) {
    console.error(error);

    return {
      stderr: "Unable to connect to Judge0.",
    };
  }
}
