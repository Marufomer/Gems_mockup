# 📁 Exam JSON Files Directory (`src/exams/`)

Add any new exam JSON file directly to this folder! The application will **automatically discover and display it** on the dashboard and in the exam forum.

---

### 📝 JSON Format Reference:

Create a file such as `my-exam.json` with the following structure:

```json
{
  "id": "my-exam-id",
  "title": "Exam Title –\nIntroduction",
  "module": "Your Module Name",
  "description": "Short summary of what this exam tests.",
  "durationMinutes": 150,
  "totalQuestions": 100,
  "color": "blue",
  "questions": [
    {
      "id": 1,
      "question": "What is the question text?",
      "options": [
        "A. Option 1",
        "B. Option 2",
        "C. Option 3",
        "D. Option 4"
      ],
      "correctIndex": 1,
      "explanation": "Detailed explanation for the correct answer."
    }
  ]
}
```

### 🎨 Available Colors:
- `"blue"` (Default)
- `"purple"`
- `"green"`
- `"amber"` / `"yellow"`
- `"rose"` / `"red"`
- `"indigo"`
- `"cyan"`
- `"teal"`

### ⚡ Automatic Features:
- **No manual import required**: Any `.json` file added to `src/exams/` is loaded dynamically.
- **Auto-assigned IDs**: If `"id"` is omitted, the file name (without `.json`) will be used as the ID.
- **Dynamic question count**: If `"totalQuestions"` is omitted, it defaults to the length of the `"questions"` array.
- **Instant Live Update**: Vite automatically hot-reloads your new exam into the website!
