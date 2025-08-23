// server.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(express.static("public"));

// Supabase client
const SUPABASE_URL = "https://pylqpphvwiysnyicopze.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5bHFwcGh2d2l5c255aWNvcHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTY4MjYsImV4cCI6MjA3MTQzMjgyNn0.X9vaZabVsMcT0xsDVn2yaqt-WMM3VQFo3gEzkUoo_DM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// API route to handle feedback form
app.post("/api/feedback", async (req, res) => {
  try {
    const { role, name, email, instagram, last_campaign, worst_part, platform_help, one_thing } = req.body;

    const { data, error } = await supabase
      .from("feedback")
      .insert([{ 
        role, 
        name, 
        email, 
        instagram, 
        last_campaign, 
        worst_part, 
        platform_help, 
        one_thing 
      }])
      .select();

    if (error) {
      console.error("❌ Error saving feedback:", error.message);
      return res.status(500).json({ success: false, message: "Failed to save feedback", error: error.message });
    }

    console.log("✅ Feedback saved:", data);
    res.json({ success: true, message: "Feedback submitted successfully!", data });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});