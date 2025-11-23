const BACKEND_URL = "https://resistor-scanner-backend-n4g5.onrender.com";

async function sendToBackend(file, previewUrl) {
  setIsLoading(true);
  setErrorMsg(null);
  try {
    const form = new FormData();
    form.append("image", file);

    const res = await axios.post(
      `${BACKEND_URL}/api/scan/file`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      }
    );

    if (res?.data) {
      if (typeof onResult === "function") onResult(res.data, previewUrl);
    } else {
      setErrorMsg("Invalid response from server");
    }
  } catch (err) {
    console.error(err);
    setErrorMsg(err?.response?.data?.error || err.message || "Upload failed");
  } finally {
    setIsLoading(false);
  }
}
