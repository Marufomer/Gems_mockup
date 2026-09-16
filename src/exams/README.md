# ✈️ Aviation Exams Guide & JSON Documentation (`src/exams/`)

Welcome! This folder contains all the examination JSON files. The website **automatically discovers and categorizes every `.json` file** placed in this folder into the 3 Courses and 2 Sub-sections.

---

## 🏛️ Course & Sub-Section Architecture

The main page is divided into **3 Examination Courses**, and each course has **3 Sub-Sections**:

| Course | ID (`course`) | Sub-Sections (`category`) |
| :--- | :--- | :--- |
| **Avionic Exam** | `"avionics"` | 1. **Part Exam** (`"category": "part"`)<br>2. **Subfinal and School Exam** (`"category": "school_final"`)<br>3. **our exam(B278)** (`"category": "our_exam_b278"` or `"b278"`) |
| **Airframe Exam** | `"airframe"` | 1. **Part Exam** (`"category": "part"`)<br>2. **Subfinal and School Exam** (`"category": "school_final"`)<br>3. **our exam(B278)** (`"category": "our_exam_b278"` or `"b278"`) |
| **Powerplant Exam** | `"powerplant"` | 1. **Part Exam** (`"category": "part"`)<br>2. **Subfinal and School Exam** (`"category": "school_final"`)<br>3. **our exam(B278)** (`"category": "our_exam_b278"` or `"b278"`) |

---

## 📝 Required JSON Fields Reference

Every exam JSON file in `src/exams/` should follow this structure:

```json
{
  "id": "airframe-part-1-structures",
  "title": "Airframe – Module 1: Structures & Sheet Metal",
  "module": "AF-01 Structures",
  "course": "airframe",
  "category": "part",
  "description": "Comprehensive exam covering aircraft sheet metal, rivets, composite materials, and structural repairs.",
  "durationMinutes": 150,
  "totalQuestions": 50,
  "color": "green",
  "questions": [
    {
      "id": 1,
      "question": "Which rivet type is commonly referred to as an 'icebox' rivet?",
      "options": [
        "A. 1100 (A)",
        "B. 2017 (D) and 2024 (DD)",
        "C. 2117 (AD)",
        "D. 5056 (B)"
      ],
      "correctIndex": 1,
      "explanation": "2017 (D) and 2024 (DD) alloy rivets must be heat-treated and stored in a sub-zero freezer (icebox) to delay age hardening before driving."
    }
  ]
}
```

### 🔑 Field Details:

| Field | Type | Description | Allowed Values |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Unique identifier for the exam (URL & state tracking). | e.g. `"avo-1-module-1"`, `"af-school-final"` |
| `title` | `string` | Display title of the exam. | Any string (e.g. `"Powerplant School Final (100Q)"`) |
| `module` | `string` | Module / subject tag displayed on cards & headers. | e.g. `"AVO-1"`, `"ET-AV07.6"`, `"Turbine Engines"` |
| `course` | `string` | **Which course this exam belongs to.** | `"avionics"`, `"airframe"`, or `"powerplant"` |
| `category` | `string` | **Which sub-section this exam belongs to.** | `"part"` (Part Exam), `"school_final"` (Subfinal & School Exam), or `"our_exam_b278"` (our exam(B278)) |
| `description` | `string` | Summary of topics covered by this exam. | Any descriptive text |
| `durationMinutes`| `number` | Timed duration in Exam Mode (countdown timer). | Defaults to `150` minutes |
| `totalQuestions` | `number` | Total number of questions (auto-verified against `questions.length`). | e.g. `50`, `90` |
| `color` | `string` | Card accent color. | `"blue"`, `"green"`, `"purple"`, `"amber"`, `"rose"` |
| `questions` | `array` | Array of question objects. | See question format below |

---

## ❓ Question Object Format

Each item in the `"questions"` array must have:

```json
{
  "id": 1,
  "question": "Question text to display?",
  "options": [
    "A. First choice",
    "B. Second choice",
    "C. Third choice",
    "D. Fourth choice"
  ],
  "correctIndex": 0,
  "explanation": "Explanation shown immediately in Practice Mode and on the Results Page."
}
```

> ⚠️ **Note on `correctIndex`**:
> - `0` = First option (A)
> - `1` = Second option (B)
> - `2` = Third option (C)
> - `3` = Fourth option (D)

---

## 📋 Copy-and-Paste Templates for Each Course & Sub-Section

### 1. ⚡ Avionics Exam

#### A. Avionics Part Exam:
Save as `src/exams/AVO-3_Part_1.json`:
```json
{
  "id": "avo-3-part-1",
  "title": "AVO-3 – Part 1: Digital Electronics",
  "module": "AVO-3 Digital Techniques",
  "course": "avionics",
  "category": "part",
  "description": "Exam covering logic gates, binary mathematics, flip-flops, encoders, decoders, and microprocessors.",
  "durationMinutes": 120,
  "color": "blue",
  "questions": [
    {
      "id": 1,
      "question": "What is the output of an exclusive-OR (XOR) gate when both inputs are HIGH (1)?",
      "options": [
        "A. HIGH (1)",
        "B. LOW (0)",
        "C. High impedance",
        "D. Indeterminate"
      ],
      "correctIndex": 1,
      "explanation": "An XOR gate produces a HIGH output only when the inputs are different. When both inputs are 1, output is 0."
    }
  ]
}
```

#### B. Avionics Subfinal & School Exam:
Save as `src/exams/Avo_school_final_90Q.json`:
```json
{
  "id": "avo-school-final-90q",
  "title": "Avo school final(90Q)",
  "module": "AVO School Final",
  "course": "avionics",
  "category": "school_final",
  "description": "90-question AVO school final covering avionics, electrical, electronic, instruments, and navigation.",
  "durationMinutes": 150,
  "color": "blue",
  "questions": [ ... ]
}
```

---

### 2. ✈️ Airframe Exam

#### A. Airframe Part Exam:
Save as `src/exams/AF-1_Hydraulics_Exam.json`:
```json
{
  "id": "af-1-hydraulics",
  "title": "Airframe – Module 1: Hydraulic & Pneumatic Systems",
  "module": "AF-01 Hydraulics",
  "course": "airframe",
  "category": "part",
  "description": "Exam covering hydraulic reservoirs, pumps, selector valves, actuators, accumulators, and MIL-H-5606 / Skydrol fluids.",
  "durationMinutes": 150,
  "color": "green",
  "questions": [
    {
      "id": 1,
      "question": "Which type of hydraulic fluid has a phosphate ester base and is purple in color?",
      "options": [
        "A. Mineral base (MIL-H-5606)",
        "B. Vegetable base (MIL-H-7644)",
        "C. Synthetic base (Skydrol)",
        "D. Water-glycol base"
      ],
      "correctIndex": 2,
      "explanation": "Skydrol is a phosphate ester synthetic fluid that is fire-resistant and light purple in color."
    }
  ]
}
```

#### B. Airframe Subfinal & School Exam:
Save as `src/exams/Airframe_School_Final_Exam.json`:
```json
{
  "id": "airframe-school-final",
  "title": "Airframe School Final Exam (100Q)",
  "module": "Airframe School Final",
  "course": "airframe",
  "category": "school_final",
  "description": "Comprehensive school final examination covering all airframe structures, systems, aerodynamics, and regulations.",
  "durationMinutes": 180,
  "color": "green",
  "questions": [
    {
      "id": 1,
      "question": "Primary flight control surfaces that control movement around the longitudinal axis are the —",
      "options": [
        "A. Elevators",
        "B. Rudder",
        "C. Ailerons",
        "D. Flaps"
      ],
      "correctIndex": 2,
      "explanation": "Ailerons control roll around the longitudinal axis."
    }
  ]
}
```

---

### 3. ⚙️ Powerplant Exam

#### A. Powerplant Part Exam:
Save as `src/exams/PP-1_Turbine_Engines.json`:
```json
{
  "id": "pp-1-turbine-engines",
  "title": "Powerplant – Module 1: Gas Turbine Engines",
  "module": "PP-01 Turbine Engines",
  "course": "powerplant",
  "category": "part",
  "description": "Exam covering turbojet, turbofan, turboprop principles, axial & centrifugal compressors, combustion chambers, and turbine sections.",
  "durationMinutes": 150,
  "color": "purple",
  "questions": [
    {
      "id": 1,
      "question": "In an axial-flow compressor, what is the function of stator vanes?",
      "options": [
        "A. Decrease pressure and increase air velocity",
        "B. Convert velocity into pressure and direct air to the next rotor stage",
        "C. Cool the rotor blades",
        "D. Regulate fuel flow to the combustion chamber"
      ],
      "correctIndex": 1,
      "explanation": "Stator vanes act as diffusers at each stage, converting kinetic energy (velocity) to pressure and directing air at the proper angle to the next rotor."
    }
  ]
}
```

#### B. Powerplant Subfinal & School Exam:
Save as `src/exams/Powerplant_School_Final_Exam.json`:
```json
{
  "id": "powerplant-school-final",
  "title": "Powerplant School Final Exam (100Q)",
  "module": "Powerplant School Final",
  "course": "powerplant",
  "category": "school_final",
  "description": "Comprehensive school final examination covering reciprocating engines, gas turbine engines, propellers, ignition, lubrication, and fuel systems.",
  "durationMinutes": 180,
  "color": "purple",
  "questions": [
    {
      "id": 1,
      "question": "Detonation in a reciprocating aircraft engine occurs when —",
      "options": [
        "A. The fuel-air charge ignites before the timed spark",
        "B. The unburned charge spontaneously ignites with explosive velocity",
        "C. The mixture is excessively rich",
        "D. The spark plug gap is too wide"
      ],
      "correctIndex": 1,
      "explanation": "Detonation is uncontrolled, instantaneous explosive combustion of the remaining unburned fuel-air mixture in the cylinder."
    }
  ]
}
```

---

## 🤖 Smart Auto-Detection (Fallback)

If you forget to add `"course"` or `"category"` into your JSON file, the loader automatically detects them:

1. **Course Auto-Detection**:
   - If filename, title, or module contains `avo`, `avionic`, or `et-av` ➔ **Avionic Exam**
   - If filename, title, or module contains `airframe` or `af` ➔ **Airframe Exam**
   - If filename, title, or module contains `powerplant`, `engine`, or `pp` ➔ **Powerplant Exam**

2. **Sub-Section Auto-Detection**:
   - If filename, title, or module contains `b278`, `our exam`, or `our_exam` ➔ **our exam(B278)**
   - If filename, title, or module contains `school`, `final`, or `subfinal` ➔ **Subfinal and School Exam**
   - Otherwise ➔ **Part Exam**

---

## ⚡ Live Auto-Reload

- **No code changes needed**: Simply create and save a `.json` file in `src/exams/`.
- The website immediately discovers the new exam, places it under the correct Course and Sub-Section (`Part Exam`, `Subfinal and School Exam`, or `our exam(B278)`), and makes it available to take in **Exam Mode** (timed) or **Practice Mode** (untimed with instant answers)!
