import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import QuestionnaireWizard from '../src/QuestionnaireWizard';
import { useAuth } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";

// Mock the module, defining the mock structure inside the factory
vi.mock('../convex/_generated/api', () => ({
  api: {
    steps: {
      list: vi.fn(),
    },
    questionnaires: {
      createQuestionnaire: vi.fn(),
      saveAnswer: vi.fn(),
      completeQuestionnaire: vi.fn(),
    },
  }
}));

// Mock Clerk's useAuth hook
vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: true, userId: 'test-user-id' })),
}));

// Mock steps data (including multiple types)
const mockSteps = [
  {
    _id: 'step1_id',
    prdId: 'step-01-workflow-bottlenecks',
    index: 0,
    title: 'Workflow Bottlenecks & Pain-Points',
    prompt: 'Walk me through the most time-consuming part of a typical patient visit.',
    type: 'text',
    options: null,
  },
  {
    _id: 'step2_id',
    prdId: 'step-02-data-sources',
    index: 1,
    title: 'Data Sources',
    prompt: 'What data sources are you using?',
    type: 'select',
    options: ['EHR', 'Lab Systems', 'PACS', 'Patient Portal'],
  },
  {
    _id: 'step3_id',
    prdId: 'step-03-success-metrics',
    index: 2,
    title: 'Success Metrics',
    prompt: 'Which metrics would indicate success for this project?',
    type: 'multiselect',
    options: ['Time Savings', 'Error Reduction', 'Patient Satisfaction', 'Cost Savings'],
  },
];

describe('QuestionnaireWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Configure mocks with proper casting to avoid type errors
    (api.steps.list as unknown as Mock<any>).mockReturnValue(mockSteps as any);
    (api.questionnaires.createQuestionnaire as unknown as Mock<any>).mockResolvedValue('new_q_id');
    (api.questionnaires.saveAnswer as unknown as Mock<any>).mockResolvedValue(null);
    (api.questionnaires.completeQuestionnaire as unknown as Mock<any>).mockResolvedValue(null);

    (useAuth as Mock).mockReturnValue({ isSignedIn: true, userId: 'test-user-id' });
  });

  test('should render the first step (text input) correctly', () => {
    render(<QuestionnaireWizard />); // Render directly
    expect(screen.getByText(mockSteps[0].prompt)).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  test('should call saveAnswer and navigate to next step on Next click', async () => {
    render(<QuestionnaireWizard />); // Render directly

    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });
    const testInput = "This is the bottleneck description.";

    fireEvent.change(textarea, { target: { value: testInput } });
    fireEvent.click(nextButton);

    // Check the mocked API functions
    await waitFor(() => {
      expect(api.questionnaires.createQuestionnaire).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledTimes(1);
      const fieldName = mockSteps[0].prdId ?? mockSteps[0]._id;
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledWith({
        questionnaireId: 'new_q_id',
        stepId: mockSteps[0]._id,
        value: { [fieldName]: testInput },
        skipped: false,
      });
    });

    expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeEnabled();
  });

  test('should pass correct value shape to saveAnswer', async () => {
    render(<QuestionnaireWizard />);
    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });
    const testInput = "Bottleneck text";

    fireEvent.change(textarea, { target: { value: testInput } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledTimes(1);
      // Verify the arguments passed to the actual saveAnswer mutation
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: testInput, // saveAnswer likely expects the direct value, not the whole form object
        skipped: false,
      }));
    });
  });

  // Tests for Back button functionality
  test('should enable back button after navigating to second step', async () => {
    render(<QuestionnaireWizard />);

    // First step - enter text and go to next
    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(textarea, { target: { value: 'Some bottleneck text' } });
    fireEvent.click(nextButton);

    // Now we should be on the second step
    await waitFor(() => {
      expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    });

    // Back button should be enabled
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeEnabled();
  });

  test('should navigate to previous step when back button is clicked', async () => {
    render(<QuestionnaireWizard />);

    // First step - enter text and go to next
    const textarea = screen.getByRole('textbox');
    const nextButton = screen.getByRole('button', { name: /next/i });

    fireEvent.change(textarea, { target: { value: 'Some bottleneck text' } });
    fireEvent.click(nextButton);

    // Now we should be on the second step
    await waitFor(() => {
      expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    // Should be back on first step
    await waitFor(() => {
      expect(screen.getByText(mockSteps[0].prompt)).toBeInTheDocument();
    });

    // Back button should be disabled again
    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled();
  });

  // Test for skipping a question
  test('should handle skipping a question with empty input', async () => {
    // Mock window.confirm to always return true (confirm skip)
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);

    try {
      render(<QuestionnaireWizard />);

      // Don't enter any text, just click next (which should trigger a skip)
      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      // Check that window.confirm was called
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith("Skip this question?");
      });

      // Check saveAnswer was called with skipped:true
      await waitFor(() => {
        expect(api.questionnaires.saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
          value: "",
          skipped: true
        }));
      });

      // Should advance to next step
      expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    } finally {
      window.confirm = originalConfirm; // Restore original confirm
    }
  });

  // Test for finishing the questionnaire on the last step
  test('should call completeQuestionnaire when submitting the last step', async () => {
    render(<QuestionnaireWizard />);

    // Navigate to the last step (step 3) by submitting each step
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Submit first step
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 1 answer' } });
    fireEvent.click(nextButton);

    // Wait for second step to appear and submit it
    await waitFor(() => {
      expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    });

    // Select an option for second step (select type)
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // Wait for dropdown to appear and select an option
    await waitFor(() => {
      const option = screen.getByRole('option', { name: 'EHR' });
      fireEvent.click(option);
    });

    // Submit second step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for third step to appear and submit it
    await waitFor(() => {
      expect(screen.getByText(mockSteps[2].prompt)).toBeInTheDocument();
    });

    // Select options for third step (multiselect type)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select first option

    // Last step should show "Finish" button instead of "Next"
    const finishButton = screen.getByRole('button', { name: /finish/i });
    expect(finishButton).toBeInTheDocument();

    // Submit final step
    fireEvent.click(finishButton);

    // Should call completeQuestionnaire
    await waitFor(() => {
      expect(api.questionnaires.completeQuestionnaire).toHaveBeenCalledTimes(1);
      expect(api.questionnaires.completeQuestionnaire).toHaveBeenCalledWith({
        questionnaireId: 'new_q_id'
      });
    });
  });

  // Tests for rendering different input types
  test('should render select input for select-type question', async () => {
    render(<QuestionnaireWizard />);

    // Go to second step (select type)
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 1 answer' } });
    fireEvent.click(nextButton);

    // Check select component is rendered
    await waitFor(() => {
      expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Check options are available when clicked
    fireEvent.click(screen.getByRole('combobox'));
    await waitFor(() => {
      mockSteps[1].options?.forEach(option => {
        expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
      });
    });
  });

  test('should render checkboxes for multiselect-type question', async () => {
    render(<QuestionnaireWizard />);

    // Navigate to the third step (multiselect)
    const nextButton = screen.getByRole('button', { name: /next/i });

    // Submit first step
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step 1 answer' } });
    fireEvent.click(nextButton);

    // Wait for second step, then submit it
    await waitFor(() => {
      expect(screen.getByText(mockSteps[1].prompt)).toBeInTheDocument();
    });

    // Select an option for the select input
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('option', { name: 'EHR' }));
    });

    // Submit second step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Verify multiselect rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[2].prompt)).toBeInTheDocument();

      // Check all options are rendered with checkboxes
      mockSteps[2].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });

      // Should have 4 checkboxes (one for each option)
      expect(screen.getAllByRole('checkbox').length).toBe(4);
    });

    // Test selecting multiple options
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[2]);

    // Submit with multiple selections
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));

    // Verify the saveAnswer call with multiple selections
    await waitFor(() => {
      expect(api.questionnaires.saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: expect.arrayContaining([
          mockSteps[2].options?.[0],
          mockSteps[2].options?.[2]
        ]),
        skipped: false
      }));
    });
  });
}); 