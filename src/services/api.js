// export async function fetchLatestLandmark() {
//   const res = await fetch("http://localhost:5000/api/landmarks/latest");
//   return res.json();
// }
export async function fetchLatestLandmark() {
  try {
    const res = await fetch("http://localhost:5000/api/landmarks/latest");
    return res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    return null;
  }
}
