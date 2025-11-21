export class UssdService {
  generateSessionId() {
    return "SESSION_" + Math.floor(Math.random() * 1000000);
  }

  getPhoneNumber() {
    return "+233555000111"; // placeholder
  }

  getSelectedApp() {
    return { code: "*123#", name: "Demo App" }; // mock selected app
  }

  async sendUSSD({ text, phoneNumber, sessionId, appCode }) {
    console.log("Sending:", { text, phoneNumber, sessionId, appCode });

    return new Promise((resolve) => {
      setTimeout(() => {
        if (!text) resolve("CON Welcome to the Demo App\n1. Continue\n2. Exit");
        else if (text === "1") resolve("END Thanks for using the demo!");
        else resolve("CON Invalid option\n1. Continue\n2. Exit");
      }, 1000);
    });
  }
}
