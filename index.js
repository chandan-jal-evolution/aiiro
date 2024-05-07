const express = require("express");
const cors = require("cors");
const { PostHog } = require("posthog-node");

const app = express();

// constants
const PORT = 4000;
const PROJECT_KEY = "phc_NrLMvJ0FwsJpNF4D7RCxiF0CRlGCfi60XN8TqoSqFTQ";
const PROJECT_HOST = "https://us.i.posthog.com";
const PERSONAL_TOKEN = "phx_cPL2MOcGmhJVzr4G8wjIvEqfO3Co2zhHb5M48xWdZYI";

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ allowedHeaders: "*", origin: "*" }));

const client = new PostHog(PROJECT_KEY, {
  host: PROJECT_HOST,
});

app.get("/events", async (req, res) => {
  try {
    const response = await client.fetch(
      `https://app.posthog.com/api/projects/67344/events/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PERSONAL_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/open", (req, res) => {
  try {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const host = req.headers.host;

    // If ip is an IPv6-mapped IPv4 address, remove the prefix
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7); // Remove the '::ffff:' prefix
    }

    client.capture({
      distinctId: ip, // Date.now().toString(),
      event: "open_chat",
      properties: {
        ip,
        host,
      },
    });

    res.send({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
});

// Send queued events immediately. Use for example in a serverless environment
// where the program may terminate before everything is sent.
// Use `client.flush()` instead if you still need to send more events or fetch feature flags.
// client.shutdown();

app.listen(PORT, () => {
  console.log("Listening on port 4000");
});
