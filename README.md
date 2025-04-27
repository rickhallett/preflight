# PreFlight: Healthcare AI Readiness Assessment

PreFlight is a comprehensive questionnaire-based tool designed to help healthcare organizations assess their readiness for implementing AI solutions. By guiding stakeholders through a structured series of questions, PreFlight provides valuable insights and recommendations that pave the way for successful AI integration.

![PreFlight Logo](https://place-hold.it/800x200/teal/white?text=PreFlight&fontsize=60)

## 🚀 Features

- **Interactive Questionnaire Wizard**: Guide users through a sequence of tailored questions
- **Multi-Question Types**: Support for text, select, radio, checkboxes, sliders, and complex custom components
- **Real-time Data Persistence**: Save answers as users progress
- **Progress Tracking**: Visual indicators of completion status
- **Results Dashboard**: Comprehensive view of completed assessments
- **Responsive Design**: Fully functional on desktop and mobile devices
- **Accessibility Compliant**: WCAG 2.2 AA standards support

## 🧰 Technology Stack

### Frontend
- **React 19**: Latest React features with full TypeScript support
- **Vite**: Modern build tool for fast development and optimal bundling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: High-quality component library built on Radix UI
- **React Hook Form + Zod**: Type-safe form validation

### Backend
- **Convex**: Real-time backend with automatic database synchronization
- **TypeScript**: End-to-end type safety
- **Bun**: Fast JavaScript runtime and package manager

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Bun](https://bun.sh/) for package management and running scripts
- A [Convex](https://convex.dev) account for the backend

## 🛠️ Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/preflight.git
   cd preflight
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the project root with:
   ```
   # Development
   CONVEX_DEPLOYMENT=your_dev_deployment_id
   ```

4. **Start the development servers**
   ```bash
   bun run dev
   ```
   This will start both the Convex backend and the Vite development server.

5. **Open your browser**
   The application will be available at [http://localhost:5173](http://localhost:5173)

## 📊 Project Structure

```
preflight/
├── convex/                 # Backend code & schema
│   ├── _generated/         # Generated Convex types
│   ├── schema.ts           # Database schema
│   ├── questionnaires.ts   # Questionnaire-related functions
│   ├── steps.ts            # Step definitions
│   └── reminders.ts        # Notification system
├── src/                    # Frontend code
│   ├── components/         # Reusable UI components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utilities and helpers
│   ├── hooks/              # Custom React hooks
│   ├── App.tsx             # Main application component
│   ├── QuestionnaireWizard.tsx # Questionnaire interface
│   └── QuestionnaireList.tsx   # List of questionnaires
├── specs/                  # Product specifications
│   └── prds/               # Product Requirement Documents
├── tests/                  # Test files
├── scripts/                # Utility scripts
├── docs/                   # Documentation
└── public/                 # Static assets
```

## 📝 Questionnaire Structure

Each questionnaire consists of a series of steps, defined in the `steps` table in Convex. Steps can be of various types:

- **text**: Free-form text input
- **select**: Single-selection dropdown
- **radio**: Single-selection radio buttons
- **slider**: Numeric value selection on a range
- **range_slider_with_labels**: Custom slider with labeled intervals
- **multiselect**: Multiple checkbox selections
- **multiselect_with_slider**: Combines checkboxes with a rating slider
- **dual_slider**: Two interconnected sliders
- **matrix**: Grid of options for selection
- **ranked_choice**: Drag-and-drop ranking interface
- **conditional**: Questions that adapt based on previous answers
- **visual_selector**: Image-based selection interface
- **hierarchical_select**: Nested selection interface

## 🚢 Deployment

1. **Set up production deployment in Convex**
   ```bash
   npx convex deploy
   ```

2. **Build the frontend**
   ```bash
   bun run build
   ```

3. **Deploy the frontend**
   The static build output in the `dist` directory can be deployed to any hosting service like Vercel, Netlify, or GitHub Pages.

## 🧪 Testing

PreFlight uses Vitest and React Testing Library for testing components and functionality.

Run tests with:
```bash
bun test
```

Run tests with coverage:
```bash
bun test:coverage
```

## 🧩 PRD Consistency Tools

The project includes tools to ensure consistency between PRD specifications and their implementations:

### Auditing PRD Consistency

To check if all PRDs are consistent with their implementations:

```bash
bun run audit:prd
```

This will generate an `audit_report.csv` file with details on all inconsistencies.

### Fixing PRD Inconsistencies

To automatically fix inconsistencies found by the audit:

```bash
bun run fix:prd
```

## 🔐 Authentication

PreFlight uses Convex Auth for authentication. The current implementation uses anonymous authentication for development, but supports:

- Email/Password
- OAuth (Google, GitHub)
- JWT integration with existing auth systems

## 📊 Data Validation

The project includes a validation framework that allows you to specify validation rules for each step in the questionnaire. These rules are used both on the client and server to ensure data integrity.

### Validation Rules

You can specify validation rules in the PRD files using the following format:

```yaml
validation:
  required: true          # Whether the field is required
  minLength: 10           # Minimum text length (for text inputs)
  maxLength: 500          # Maximum text length
  minValue: 0             # Minimum numeric value
  maxValue: 100           # Maximum numeric value
  pattern: "^[A-Za-z0-9]+$"  # Regex pattern for validation
  errorMessage: "Please enter a valid value"  # Custom error message
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions, please contact [your-email@example.com](mailto:your-email@example.com) or open an issue on GitHub.
