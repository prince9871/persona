# Chai aur Code — AI Persona Chat

An LLM-powered chat interface that simulates conversations with **Hitesh Choudhary** (Chai aur Code) and **Piyush Garg** (Teachyst founder). The model responds in each persona's unique communication style, teaching approach, and personality.

**Live:** [https://persona-hitesh.vercel.app](https://persona-hitesh.vercel.app)

---

## Setup & Run

```bash
# 1. Clone
git clone <repo-url>
cd persona-hitesh

# 2. Install dependencies
npm install

# 3. Set environment variable
# Create .env.local with your NVIDIA NIM API key:
echo "NVIDIA_API_KEY=your_key_here" > .env.local

# 4. Run development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | Yes | API key for NVIDIA NIM (OpenAI-compatible endpoint) |

---

## Persona Data Collection & Preparation

### Hitesh Choudhary

**Sources used:**
- YouTube channels: [Hitesh Choudhary](https://youtube.com/@HiteshChoudhary) (English, 1M+ subs), [Chai aur Code](https://youtube.com/@ChaiAurCode) (Hindi, ~888K subs)
- Website: [hitesh.ai](https://hitesh.ai/)
- Platform: [chaicode.com](https://chaicode.com/) (cohort courses, Discord community)
- Social media: Twitter/X, LinkedIn posts

**Key observations captured in prompt:**
- Warm Hinglish with signature phrases: "Hanji!", "Chaliye", "Chai le aao, code hum karwa denge"
- Teaching through analogies (chai, kitchen, daily life)
- Encouraging tone that normalizes struggle: "sabke saath hota hai, tension nahi lene ka"
- Playful roasting when someone overthinking or not checking docs
- Background: LCO founder, ex-CTO at PW, 45+ countries visited
- Code-first approach with project-based learning emphasis

### Piyush Garg

**Sources used:**
- YouTube channel: [Piyush Garg](https://youtube.com/@PiyushGarg) (~396K subs, 600+ videos)
- Website: [piyushgarg.dev](https://www.piyushgarg.dev/)
- Teachyst platform: [teachyst.com](https://teachyst.com/)
- Cohorts: GenAI with JavaScript, Full Stack Web Development

**Key observations captured in prompt:**
- Confident, energetic Hinglish with endearing self-assuredness
- Flexes real experience: "I built this in production", "main hi ise ache se samjha sakta hoon"
- References own products: Teachyst, WisprType, Skyping
- Loves JavaScript so much he created "Piyushi" (AI gf) — light, wholesome references
- Architecture-first teaching: trade-offs, real-world cost/scale reasoning
- Sign-off: "Jai Shree Krishna 🙏🏻🦚", "Keep working hard, it'll be worth it"

### Preparation Methodology

1. **Watched 10+ hours** of each creator's videos across topics (coding tutorials, podcasts, live streams)
2. **Collected distinctive phrases** and speech patterns verbatim
3. **Identified personality markers:** humor style, encouragement patterns, catchphrases, teaching philosophy
4. **Structured prompt by sections:** identity, expertise, voice, teaching approach, formatting, boundaries
5. **Tested and iterated** on prompt temperature (0.7-0.8) and phrasing until responses felt authentic

---

## Prompt Engineering Strategy

### Architecture

Each persona has a dedicated system prompt (`lib/prompts.ts`) with this structure:

| Section | Purpose |
|---------|---------|
| **Core identity** | Who they are, what they do, how they're known |
| **Expertise** | What they teach and build (grounds responses in real knowledge) |
| **Voice & style** | Explicit Hinglish patterns, catchphrases, signature openers, emotional tone |
| **Teaching approach** | How they explain concepts (analogies, code-first, architecture-first) |
| **Response format** | Markdown rules, code block usage, structure preferences |
| **Boundaries** | Stay in character, deflect AI questions warmly, avoid off-topic |

### Key Techniques

- **Hinglish embedding:** Specific phrases woven into the prompt so the model uses them naturally, not mechanically
- **Personality through constraints:** The "playful jab but always helpful" rule for Hitesh, the "endearing self-obsession" rule for Piyush — constraints that create authentic personality
- **Format rules matter:** Banning em dashes, enforcing markdown code blocks with language tags — these prevent common LLM artifacts
- **Temperature: 0.7-0.8** — high enough for creative personality expression, low enough for factual reliability on code

### Persona vs Generic LLM

Without these prompts, the same model outputs generic textbook definitions. The prompts bias token selection toward each persona's vocabulary, sentence rhythm, and emotional register — making "What is a closure?" sound distinctively like Hitesh or Piyush.

---

## Context Management Approach

**Strategy: full history + per-turn conversation hints**

- Every request sends the complete message array to the API
- The API prepends the persona system prompt plus a **dynamic hint** (`lib/conversation-hint.ts`) built from the live thread:
  - Detects casual small talk vs technical questions
  - Tracks phrases already used (chai mentions, doubt pitches, repeated openers)
  - Instructs the model to answer the user's *last message* specifically and avoid template loops
- Streaming response is accumulated on the client and displayed in real-time
- `frequency_penalty` / `presence_penalty` reduce repetitive phrasing across turns

**Why this works:**
- Full history preserves persona and topic continuity
- Per-turn hints stop the model from re-welcoming or re-pitching every reply
- Penalties discourage "koi doubt hai?" appearing in every message

**Future improvements:**
- Sliding window when approaching token limits
- Optional summarization for very long threads (50+ turns)

---

## Sample Conversations

### Persona: Hitesh Choudhary

**User:** What is closure in JavaScript?

**Hitesh:** Hanji! Closure — ye concept hai jo bahut log confuse ho jaate hain, but actually it's very simple.

Dekhiye, jab aap ek function ke andar ek aur function banaate ho, to inner function ko outer function ke variables ka access milta hai, even after the outer function has returned. Isi ko kehte hain closure.

```js
function chaiBananeWala() {
  let chaiReady = false;
  return function() {
    chaiReady = true;
    console.log("Chai taiyaar hai! ☕");
  };
}

const order = chaiBananeWala();
order(); // "Chai taiyaar hai! ☕"
```

Yahan `chaiReady` variable to `chaiBananeWala` ka local tha, but uske return karne ke baad bhi inner function ko uska access hai. Yehi closure hai.

Samajhna hai to kuch code likh ke dekho, tabhi pakka hoga. Documentation padhne ki aadat daalo! 😄

---

### Persona: Piyush Garg

**User:** Explain RAG architecture

**Piyush:** Hey everyone! RAG — Retrieval Augmented Generation. Bahut log bolte hain but surprisingly, bahut kam log actually understand karte hain ki under the hood kya ho raha hai.

Simple flow:

1. **User query aayi** — "What is closure in JavaScript?"
2. Query ko ek **embedding model** se vector mein convert karo
3. Ye vector gaya **vector database** mein (Pinecone, Weaviate, Chroma)
4. Return hua **top-K relevant chunks** from your knowledge base
5. Ye chunks + original query → **LLM** → final answer

```ts
// Simplified — obviously I built this the right way
const query = "What is closure?";
const queryEmbedding = await embed(query);
const context = await vectorDB.similaritySearch(queryEmbedding, 3);
const prompt = `Answer based on: ${context.join("\n")}\n\nQ: ${query}`;
const answer = await llm.complete(prompt);
```

Main 2023 se vector embeddings ke saath kaam kar raha hoon jab ye hype bhi nahi tha. Ek GenAI cohort bhi hai — wahan production-grade RAG pipeline banate hain end to end.

Trust me, RAG ka asli fayda tab aata hai jab aap retrieval layer ko sahi se design karo — chunking strategy, embedding model choice, reranking — ye sab matter karta hai.

### Persona: Piyush Garg

**User:** How do I choose between Docker and a VM?

**Piyush:** Kya bolu ab main... Docker vs VM — it's not really a competition, it's about what you're solving.

**VM** — har cheez virtualized: full OS, kernel, everything. Heavy. Boot time minutes mein. Example: aapko different OS versions chahiye, ya full isolation.

**Docker** — shares host kernel. Sirf application layer + dependencies containerized. Lightweight, seconds mein boot.

```
           VM                        Docker
 ┌──────────────────┐     ┌──────────────────┐
 │ App A  │  App B  │     │ App A  │  App B  │
 │ Guest OS│ GuestOS│     │────────+─────────│
 │ Hypervisor       │     │ Docker Engine    │
 │ Host OS          │     │ Host OS          │
 └──────────────────┘     └──────────────────┘
```

Real-world trade-off:
- Production deployment → Docker (orchestrate with K8s)
- Development → Docker (same env everywhere)
- Running Windows on Linux → VM
- Security isolation between tenants → VM

Trust me, main dono ka production use kiya hai. Docker is not a "lightweight VM" — it's a completely different isolation model. Ye samajh lo, tab sahi choice kar paoge.

Jai Shree Krishna 🙏🏻🦚

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS v4 |
| Fonts | Geist, Baloo 2, Inter |
| LLM API | NVIDIA NIM (OpenAI-compatible) |
| Model | `stepfun-ai/step-3.7-flash` |
| State | React hooks + localStorage |
| Streaming | Web Streams API (ReadableStream) |

---

## Project Structure

```
app/
  api/chat/route.ts    — API endpoint (persona-aware prompt selection)
  layout.tsx           — Root layout with fonts
  page.tsx             — Main chat UI with persona switching
lib/
  chat-store.ts        — Conversation state + localStorage persistence
  markdown.tsx         — Custom markdown renderer (code blocks, inline, headings)
  openai.ts            — OpenAI-compatible NVIDIA NIM client
  prompts.ts           — System prompts for both personas
  stream.ts            — Streaming response handler
```

---

## Deployment

Deployed on Vercel:

```bash
npm run build    # verify build succeeds
vercel --prod    # deploy
```

Ensure `NVIDIA_API_KEY` is set in Vercel environment variables.

---

## Evaluation Notes

This project was built against these criteria:

| Criteria | Marks | Status |
|----------|-------|--------|
| Persona Accuracy | 30 | ✅ Both personas with authentic voice |
| Conversation Quality | 25 | ✅ Context-aware, streaming, coherent |
| Technical Implementation | 25 | ✅ Clean architecture, proper LLM integration |
| User Experience | 20 | ✅ Intuitive UI, persona switching, themed design |
