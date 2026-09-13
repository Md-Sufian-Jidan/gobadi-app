                            [User Uploads Image]
                                     │
                                     ▼
                      ┌───────────────────────────────┐
                      │    API Dispatcher / Gateway   │
                      └───────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │ (Primary Path)                        │ (Fallback Path: Triggers if Gemini Fails)
                 ▼                                       ▼
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│ Step 1: Gemini 1.5 Flash        │     │ Fallback: Gemini 1.5 Flash      │
│ - Raw Image Analysis            │     │ - Raw Image Analysis            │     
│ - Generates Raw Symptoms Text   │     │ - Generates Raw Symptoms Text   │     
└─────────────────────────────────┘     └─────────────────────────────────┘
                 │                                       │
                 ▼                                       │
┌─────────────────────────────────┐                      │
│ Step 2: Groq Text Model         │                      │
│ - Takes Gemini Text Report      │                      │
│ - Formats into Structured JSON  │                      │
└─────────────────────────────────┘                      │
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     ▼
                     [Frontend Displays UI Response]


                     

