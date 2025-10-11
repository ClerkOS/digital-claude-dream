# Zigma Rules System Design

## Core Philosophy

**"Rules shouldn't live in settings — they should live where the problem happens."**

The Rules system transforms data management from a technical chore into a natural conversation. Users create rules contextually, in plain English, exactly when and where they encounter problems.

---

## Design Principles

### 1. **Contextual Creation**
- Rules are created where problems are detected
- No hunting through settings menus
- Inline prompts appear under specific issues

### 2. **Plain English Interface**
- No dropdowns, logic blocks, or technical jargon
- Each rule reads like a natural sentence
- Auto-commit (no "save" buttons)

### 3. **Minimal Design Language**
- Black text on white/neutral backgrounds
- Single accent color (Zigma blue/violet)
- Soft transitions (slide, don't pop)
- Clean, notebook-like aesthetic

---

## Implementation Layers

### 1️⃣ **Dashboard Layer: Inline Rule Creation**

#### Location: Under Detected Issues
When Zigma finds data problems, it offers contextual rule creation:

```
⚠️ 7 Missing Student IDs

┌─────────────────────────────────────────────┐
│ Payment records without student identification │
│                                             │
│ 💡 Prevent this in the future:              │
│                                             │
│ [Create Rule] "From now on, always require  │
│  student ID for payment entries"            │
│                                             │
│ ✅ Auto-commit • Plain English              │
└─────────────────────────────────────────────┘
```

#### Interaction Flow:
1. User sees issue detected
2. Inline prompt appears: "Prevent this in the future"
3. User clicks → Rule creation interface slides in
4. User types natural language rule
5. Zigma confirms and auto-commits
6. Issue disappears (if rule resolves it)

#### Visual Design:
- Subtle background highlight on issue cards
- Small "Create Rule" button with soft animation
- Slide-in panel from right edge
- Minimal input field with placeholder text

---

### 2️⃣ **Chat Layer: Conversational Rules**

#### Natural Language Interface:
Users can type commands in chat:

```
User: "From now on, ignore transactions below 1 GHS"
Zigma: ✅ Got it. Added to your project rules.
      (You can review these anytime in Rules View.)

User: "Always categorize Momo transfers as digital payments"
Zigma: ✅ Rule created: Momo transfers → Digital Payments
      This will apply to 23 existing records and all future ones.
```

#### Chat Integration:
- Rules are created through natural dialogue
- Zigma confirms with clear feedback
- Shows impact (how many records affected)
- Provides link to Rules View for review

#### Response Patterns:
```
✅ Got it. Added to your project rules.
✅ Rule created: [Rule Summary]
✅ This will apply to [X] existing records and all future ones.
✅ Updated [X] records based on your new rule.
```

---

### 3️⃣ **Rules Panel: The Notebook**

#### Location: Right-side slide-out panel
- Minimal, notebook-like design
- Lists all active rules in chronological order
- Each rule as a readable sentence

#### Visual Layout:
```
┌─────────────────────────────────┐
│ Rules for [Project Name]        │
│                                 │
│ 📝 Active Rules (5)             │
│                                 │
│ • Ignore transactions below 1 GHS │
│ • Momo transfers → Digital Payments │
│ • Always require student ID for payments │
│ • Flag duplicate receipts for review │
│ • Categorize bank transfers as fees │
│                                 │
│ [Create New Rule]               │
└─────────────────────────────────┘
```

#### Features:
- **Chronological Order**: Most recent rules first
- **Simple List**: Each rule as a bullet point
- **Quick Actions**: Edit/delete on hover
- **Rule Count**: Shows total active rules
- **Create Button**: Always accessible

---

## Technical Implementation

### Rule Storage Format:
```typescript
interface ProjectRule {
  id: string;
  createdAt: Date;
  naturalLanguage: string;
  parsedLogic: RuleLogic;
  category: 'data_validation' | 'categorization' | 'filtering';
  scope: 'all_records' | 'future_only' | 'specific_conditions';
  isActive: boolean;
  appliedToRecords: number;
}
```

### Natural Language Processing:
- Parse user intent from plain English
- Convert to executable logic
- Handle ambiguity with clarification prompts
- Support common patterns:
  - "From now on..."
  - "Always..."
  - "Ignore..."
  - "Categorize X as Y"
  - "Flag...for review"

### Auto-Commit Behavior:
- Rules are immediately active
- No confirmation dialogs
- Undo available for 30 seconds
- Clear feedback on what happened

---

## User Experience Flow

### Scenario 1: Dashboard Issue Resolution
1. User sees "7 Missing Student IDs" issue
2. Clicks "Create Rule" under the issue
3. Panel slides in with context: "For payment entries without student ID:"
4. User types: "Always require student ID or mark for manual review"
5. Zigma confirms: "✅ Rule created. 7 records marked for review."
6. Issue updates to show resolution status

### Scenario 2: Chat-Based Rule Creation
1. User types in chat: "Ignore small transactions under 5 GHS"
2. Zigma responds: "✅ Got it. Added filter rule for transactions < 5 GHS."
3. Shows impact: "This affects 12 existing records (now hidden) and all future ones."
4. User can continue chatting or review rules

### Scenario 3: Rules Management
1. User clicks "Rules" in sidebar
2. Panel slides out showing all active rules
3. User can edit, delete, or create new rules
4. Changes apply immediately with confirmation

---

## Design Tokens

### Colors:
- **Primary**: Zigma Blue (#3B82F6)
- **Text**: Black (#000000) on white (#FFFFFF)
- **Background**: Neutral whites and light grays
- **Accent**: Single accent color for highlights

### Typography:
- **Rule Text**: Clean, readable sans-serif
- **Natural Language**: Conversational, friendly tone
- **Labels**: Minimal, unobtrusive

### Animations:
- **Slide Transitions**: 300ms ease-out
- **Hover States**: Subtle scale/shadow changes
- **Loading States**: Gentle pulse animations
- **Confirmations**: Soft fade-in with checkmark

---

## Success Metrics

### User Adoption:
- Rules created per session
- Time from issue detection to rule creation
- Rules panel usage frequency

### Effectiveness:
- Issues resolved by rules (vs manual fixes)
- False positive rate of rule suggestions
- User satisfaction with rule accuracy

### Engagement:
- Natural language rule creation success rate
- Chat-based rule creation usage
- Rules panel review frequency

---

## Future Enhancements

### Smart Suggestions:
- Suggest rules based on repeated manual fixes
- Learn from user patterns and offer proactive rules
- Context-aware rule recommendations

### Rule Templates:
- Common rule patterns for quick creation
- Industry-specific rule libraries
- Import/export rule sets between projects

### Advanced Logic:
- Conditional rules ("If...then...")
- Multi-step rule sequences
- Rule dependencies and ordering

---

## Implementation Priority

### Phase 1: Core Foundation
- [ ] Dashboard inline rule creation
- [ ] Basic natural language parsing
- [ ] Rules panel with simple list
- [ ] Auto-commit functionality

### Phase 2: Chat Integration
- [ ] Conversational rule creation in chat
- [ ] Natural language confirmation responses
- [ ] Rule impact feedback

### Phase 3: Advanced Features
- [ ] Rule editing and management
- [ ] Smart suggestions based on usage
- [ ] Rule templates and libraries

---

*This document serves as the foundational design for Zigma's Rules system, emphasizing contextual creation, plain English interfaces, and seamless user experience.*
