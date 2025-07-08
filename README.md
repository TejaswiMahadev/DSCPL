# 🧭 DSCPL – Your Personal Spiritual Assistant

DSCPL (Disciple) is a faith-based web application powered by **React + Vite** on the frontend and **LangChain + Gemini + FAISS** on the backend. It provides AI-generated devotionals, prayers, meditations, and accountability guides using Retrieval-Augmented Generation (RAG) from Bible texts.

---

## ✨ Features

- 📖 **Daily Devotionals** — 5-minute reads with Scripture, reflection, prayer, and a faith declaration.
- 🙏 **Guided Prayer** — Using the ACTS model (Adoration, Confession, Thanksgiving, Supplication).
- 🧘 **Christian Meditation** — With Scripture focus, breathing guidance, and deep reflection prompts.
- 🛡️ **Accountability Aid** — Tools for breaking bad habits using biblical encouragement.
- 💬 **Conversational Chat** — Ask any question about Scripture or your selected topic.

---

## ⚙️ Tech Stack

### 🔵 Frontend

- **React** (with Vite)
- **Tailwind CSS** or your preferred UI library (e.g. Shadcn/UI, MUI)
- **Chat UI** using `@stream-io`, custom components, or similar

### 🟢 Backend

- **LangChain** – RAG pipeline
- **Google Gemini 1.5 Flash** – LLM for generation and chat
- **FAISS** – Vector store for Bible text embeddings
- **Google Generative AI Embeddings**
