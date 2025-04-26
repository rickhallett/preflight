import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import QuestionnaireWizard from '../src/QuestionnaireWizard';
import { useAuth } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";
import * as convexReact from "convex/react";

// Define mocked function type
interface MockedFunction extends Mock {
  mock: {
    calls: any[][];
    results: { type: string; value: any }[];
  };
}

// Mock convex/react hooks
vi.mock("convex/react", async () => {
  const actual = await vi.importActual("convex/react");
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn()
  };
});

// Mock the module, defining the mock structure inside the factory
vi.mock('../convex/_generated/api', () => ({
  api: {
    steps: {
      list: "steps.list",
    },
    questionnaires: {
      createQuestionnaire: "questionnaires.createQuestionnaire",
      saveAnswer: "questionnaires.saveAnswer",
      completeQuestionnaire: "questionnaires.completeQuestionnaire",
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
  {
    _id: 'step4_id',
    prdId: 'step-04-integration-points',
    index: 3,
    title: 'Integration Points',
    prompt: 'Which systems would this AI need to plug into? (e.g., EHR, PACS, scheduling, billing…)',
    type: 'multiselect',
    options: ['EHR / EMR', 'PACS', 'Scheduling System', 'Billing System', 'Lab Information System (LIS)', 'Pharmacy System', 'Other (Specify)'],
  },
  {
    _id: 'step5_id',
    prdId: 'step-05-regulatory-constraints',
    index: 4,
    title: 'Regulatory & Compliance Constraints',
    prompt: 'Does your organisation permit cloud processing of PHI? (If no, please explain briefly)',
    type: 'radio',
    options: ['Yes', 'No'],
  },
  {
    _id: 'step6_id',
    prdId: 'step-06-ai-literacy',
    index: 5,
    title: 'AI Literacy & Comfort Level',
    prompt: 'On a scale of 1-5, how confident are you explaining what a large language model is?',
    type: 'radio',
    options: ['1 (Not confident at all)', '2', '3 (Somewhat confident)', '4', '5 (Very confident)'],
  },
  {
    _id: 'step7_id',
    prdId: 'step-07-privacy-risk-tolerance',
    index: 6,
    title: 'Privacy & Ethical Risk Tolerance',
    prompt: 'Which of the following risks would prevent adoption?',
    type: 'multiselect',
    options: [
      'Misdiagnosis potential', 
      'Patient data leakage', 
      'Algorithmic bias propagation', 
      'Lack of result explainability', 
      'Vendor lock-in', 
      'High implementation cost', 
      'Staff resistance', 
      'Other (Specify if possible)'
    ],
  },
  {
    _id: 'step8_id',
    prdId: 'step-08-budget-procurement',
    index: 7,
    title: 'Budget & Procurement Window',
    prompt: 'Estimate the annual budget you could justify for this solution (£0k - £200k).',
    type: 'slider',
    options: ['0', '200', '10'],
  },
  {
    _id: 'step9_id',
    prdId: 'step-09-decision-roles',
    index: 8,
    title: 'Decision-Making Roles',
    prompt: 'Who signs off on new clinical software purchases?',
    type: 'radio',
    options: [
      'CMO (Chief Medical Officer)',
      'CIO (Chief Information Officer)',
      'Practice Owner / Lead Physician',
      'Department Head',
      'Procurement Committee',
      'IT Department Lead',
      'Other'
    ],
  },
  {
    _id: 'step10_id',
    prdId: 'step-10-patient-population',
    index: 9,
    title: 'Patient-Population Characteristics & Equity Concerns',
    prompt: 'Select all relevant characteristics of your patient population:',
    type: 'multiselect',
    options: [
      'High non-English-speaking share',
      'Predominantly rural coverage',
      'Paediatric focus',
      'Geriatric focus',
      'High prevalence of specific chronic conditions (e.g., Diabetes, COPD)',
      'Underserved / vulnerable populations',
      'Technologically underserved (low digital literacy/access)',
      'Other significant demographic factors'
    ],
  },
  {
    _id: 'step11_id',
    prdId: 'step-11-monitoring-owner',
    index: 10,
    title: 'Ongoing Monitoring Owner',
    prompt: 'Who (role) will own ongoing accuracy / bias monitoring after go-live?',
    type: 'radio',
    options: [
      'Clinical Lead / Champion',
      'Dedicated Data Scientist / Analyst',
      'IT Department',
      'Quality Improvement Team',
      'External Vendor Support',
      'Not yet determined',
      'Other'
    ],
  },
  {
    _id: 'step12_id',
    prdId: 'step-12-alerting-speed',
    index: 11,
    title: 'Alerting Speed',
    prompt: 'How quickly must the team be alerted if AI performance (e.g., AUROC) drops by >5%?',
    type: 'radio',
    options: [
      'Immediately (Real-time alert)',
      'Within 1 hour',
      'Within 24 hours',
      'Within 1 week',
      'Monitored quarterly/annually'
    ],
  },
  {
    _id: 'step13_id',
    prdId: 'step-13-ai-responsibility',
    index: 12,
    title: 'AI Responsibility',
    prompt: 'If an AI suggestion is wrong, who should be held responsible?',
    type: 'radio',
    options: [
      'The clinician who acted on the suggestion',
      'The AI vendor',
      'The hospital/organization',
      'Shared responsibility',
      'Depends on the situation',
      'Other (Specify if possible)'
    ],
  },
  {
    _id: 'step14_id',
    prdId: 'step-14-ai-rationale-importance',
    index: 13,
    title: 'AI Rationale Importance',
    prompt: 'Rank how important it is that the AI can show a rationale you can present to patients.',
    type: 'radio',
    options: [
      '1 (Not important)',
      '2',
      '3 (Moderately important)',
      '4',
      '5 (Critically important)'
    ],
  },
  {
    _id: 'step15_id',
    prdId: 'step-15-deployment-preference',
    index: 14,
    title: 'Deployment Preference',
    prompt: 'What is your preferred deployment model?',
    type: 'radio',
    options: [
      'Cloud-based (SaaS)',
      'On-premise installation',
      'Mobile application (if applicable)',
      'Hybrid model'
    ],
  }
];

describe('QuestionnaireWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup useQuery mock to return the steps
    (convexReact.useQuery as Mock).mockReturnValue(mockSteps);

    // Setup useMutation mocks with proper functions
    const createQuestionnaireImpl = vi.fn().mockResolvedValue('new_q_id');
    const saveAnswerImpl = vi.fn().mockResolvedValue(null);
    const completeQuestionnaireImpl = vi.fn().mockResolvedValue(null);

    (convexReact.useMutation as Mock).mockImplementation((functionReference) => {
      if (functionReference === api.questionnaires.createQuestionnaire) {
        return createQuestionnaireImpl;
      } else if (functionReference === api.questionnaires.saveAnswer) {
        return saveAnswerImpl;
      } else if (functionReference === api.questionnaires.completeQuestionnaire) {
        return completeQuestionnaireImpl;
      }
      return vi.fn().mockResolvedValue(null);
    });

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

    // Check the mocked API functions were called
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
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
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: expect.any(String),
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
      
      // Check saveAnswer was called with expected arguments
      await waitFor(() => {
        const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
        expect(saveAnswer).toHaveBeenCalled();
        expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
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
    
    // Navigate to the last step by submitting each step
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
    
    // Submit third step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Wait for fourth step (integration-points) to appear
    await waitFor(() => {
      expect(screen.getByText(mockSteps[3].prompt)).toBeInTheDocument();
    });

    // Select an option for fourth step (multiselect type)
    const integrationCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(integrationCheckboxes[0]); // Select first option
    
    // Last step should show "Finish" button
    const finishButton = screen.getByRole('button', { name: /finish/i });
    expect(finishButton).toBeInTheDocument();
    
    // Submit final step
    fireEvent.click(finishButton);
    
    // Should call completeQuestionnaire
    await waitFor(() => {
      const completeQuestionnaire = (convexReact.useMutation as MockedFunction).mock.results[2].value;
      expect(completeQuestionnaire).toHaveBeenCalled();
      expect(completeQuestionnaire).toHaveBeenCalledWith(expect.objectContaining({
        questionnaireId: 'new_q_id'
      }));
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
    
    // Verify multiselect rendering for success metrics
    await waitFor(() => {
      expect(screen.getByText(mockSteps[2].prompt)).toBeInTheDocument();
      
      // Check all options are rendered with checkboxes
      mockSteps[2].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Should have checkboxes (one for each option)
      expect(screen.getAllByRole('checkbox').length).toBe(mockSteps[2].options?.length || 0);
    });
    
    // Test selecting multiple options
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[2]);
    
    // Submit with multiple selections
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Verify fourth step (integration-points) multiselect rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[3].prompt)).toBeInTheDocument();
      
      // Check all options are rendered with checkboxes
      mockSteps[3].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Should have checkboxes (one for each option)
      expect(screen.getAllByRole('checkbox').length).toBe(mockSteps[3].options?.length || 0);
    });
  });

  // Add a new test for radio input type
  test('should render radio buttons for radio-type question', async () => {
    render(<QuestionnaireWizard />);
    
    // Navigate to the fifth step (radio type)
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
    
    // Wait for third step (multiselect), then submit it
    await waitFor(() => {
      expect(screen.getByText(mockSteps[2].prompt)).toBeInTheDocument();
    });
    
    // Select an option for the multiselect
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Select first option
    
    // Submit third step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Wait for fourth step (integration-points), then submit it
    await waitFor(() => {
      expect(screen.getByText(mockSteps[3].prompt)).toBeInTheDocument();
    });
    
    // Select an option for integration points
    const integrationCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(integrationCheckboxes[0]); // Select first option
    
    // Submit fourth step
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Verify radio button rendering for regulatory constraints
    await waitFor(() => {
      expect(screen.getByText(mockSteps[4].prompt)).toBeInTheDocument();
      
      // Check all options are rendered with radio buttons
      mockSteps[4].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Check the radio buttons are rendered
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBe(mockSteps[4].options?.length || 0);
    });
    
    // Select "Yes" option
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]); // Select "Yes"
    
    // Verify the radio value is selected
    expect(radioButtons[0]).toBeChecked();
    
    // Submit with radio selection
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    
    // Verify the saveAnswer call with radio selection
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: "Yes",
        skipped: false
      }));
    });
  });

  // Add a test for Likert scale radio input
  test('should render Likert scale radio buttons for AI literacy step', async () => {
    render(<QuestionnaireWizard />);
    
    // Navigate through 5 steps to reach the 6th step (AI literacy)
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Submit all previous steps
    for (let i = 0; i < 5; i++) {
      // For step 1 (text input)
      if (i === 0) {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step answer' } });
      }
      // For step 2 (select input)
      else if (i === 1) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        await waitFor(() => {
          fireEvent.click(screen.getByRole('option', { name: mockSteps[1].options?.[0] || '' }));
        });
      }
      // For steps 3-4 (multiselect inputs) and step 5 (radio)
      else {
        if (i === 2 || i === 3) {
          const checkboxes = screen.getAllByRole('checkbox');
          fireEvent.click(checkboxes[0]);
        } else if (i === 4) {
          const radioButtons = screen.getAllByRole('radio');
          fireEvent.click(radioButtons[0]);
        }
      }
      
      // Click Next to proceed to next step
      fireEvent.click(nextButton);
      
      // Wait for the next step to appear
      await waitFor(() => {
        expect(screen.getByText(mockSteps[i + 1].prompt)).toBeInTheDocument();
      });
    }
    
    // Now we should be on the 6th step (AI literacy)
    // Verify Likert scale radio rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[5].prompt)).toBeInTheDocument();
      
      // Check all options are rendered with radio buttons
      mockSteps[5].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Check the radio buttons are rendered - should be 5 for the Likert scale
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBe(5);
    });
    
    // Select "5 (Very confident)" option
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[4]); // Select the highest confidence level
    
    // Verify the radio value is selected
    expect(radioButtons[4]).toBeChecked();
    
    // Submit with radio selection
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    
    // Verify the saveAnswer call with the Likert scale selection
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: "5 (Very confident)",
        skipped: false
      }));
    });
  });

  // Add a test for privacy risk tolerance multiselect
  test('should handle multiple selections for privacy risk tolerance step', async () => {
    render(<QuestionnaireWizard />);
    
    // Navigate through 6 steps to reach the 7th step (privacy risk tolerance)
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Submit all previous steps
    for (let i = 0; i < 6; i++) {
      // For step 1 (text input)
      if (i === 0) {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step answer' } });
      }
      // For step 2 (select input)
      else if (i === 1) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        await waitFor(() => {
          fireEvent.click(screen.getByRole('option', { name: mockSteps[1].options?.[0] || '' }));
        });
      }
      // For steps 3-4 (multiselect inputs) and steps 5-6 (radio)
      else {
        if (i === 2 || i === 3) {
          const checkboxes = screen.getAllByRole('checkbox');
          fireEvent.click(checkboxes[0]);
        } else if (i === 4 || i === 5) {
          const radioButtons = screen.getAllByRole('radio');
          fireEvent.click(radioButtons[0]);
        }
      }
      
      // Click Next to proceed to next step
      fireEvent.click(nextButton);
      
      // Wait for the next step to appear
      await waitFor(() => {
        expect(screen.getByText(mockSteps[i + 1].prompt)).toBeInTheDocument();
      });
    }
    
    // Now we should be on the 7th step (privacy risk tolerance)
    // Verify multiselect rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[6].prompt)).toBeInTheDocument();
      
      // Check all options are rendered with checkboxes
      mockSteps[6].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Check the checkboxes are rendered
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(mockSteps[6].options?.length || 0);
    });
    
    // Select multiple options - patient data leakage and high implementation cost
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Patient data leakage
    fireEvent.click(checkboxes[5]); // High implementation cost
    
    // Submit with multiple selections
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    
    // Verify the saveAnswer call with the multiple selections
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: expect.arrayContaining([
          'Patient data leakage',
          'High implementation cost'
        ]),
        skipped: false
      }));
    });
  });

  // Add a test for budget procurement slider
  test('should render and interact with budget slider', async () => {
    render(<QuestionnaireWizard />);
    
    // Navigate through 7 steps to reach the 8th step (budget procurement)
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Submit all previous steps
    for (let i = 0; i < 7; i++) {
      // For step 1 (text input)
      if (i === 0) {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step answer' } });
      }
      // For step 2 (select input)
      else if (i === 1) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        await waitFor(() => {
          fireEvent.click(screen.getByRole('option', { name: mockSteps[1].options?.[0] || '' }));
        });
      }
      // For steps 3-4 and 7 (multiselect inputs), steps 5-6 (radio)
      else {
        if (i === 2 || i === 3 || i === 6) {
          const checkboxes = screen.getAllByRole('checkbox');
          fireEvent.click(checkboxes[0]);
        } else if (i === 4 || i === 5) {
          const radioButtons = screen.getAllByRole('radio');
          fireEvent.click(radioButtons[0]);
        }
      }
      
      // Click Next to proceed to next step
      fireEvent.click(nextButton);
      
      // Wait for the next step to appear
      await waitFor(() => {
        expect(screen.getByText(mockSteps[i + 1].prompt)).toBeInTheDocument();
      });
    }
    
    // Now we should be on the 8th step (budget procurement)
    // Verify slider rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[7].prompt)).toBeInTheDocument();
      
      // Check min and max values are displayed
      expect(screen.getByText('£0k')).toBeInTheDocument();
      expect(screen.getByText('£200k')).toBeInTheDocument();
      
      // Check the slider is rendered
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
    });
    
    // Interact with the slider - setting value to 100
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 100 } });
    
    // Submit with slider selection
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    
    // Verify the saveAnswer call with the slider value
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: 100,
        skipped: false
      }));
    });
  });

  // Add a test for decision roles radio inputs
  test('should render and interact with decision roles radio inputs', async () => {
    render(<QuestionnaireWizard />);
    
    // Navigate through 8 steps to reach the 9th step (decision roles)
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Submit all previous steps
    for (let i = 0; i < 8; i++) {
      // For step 1 (text input)
      if (i === 0) {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step answer' } });
      }
      // For step 2 (select input)
      else if (i === 1) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        await waitFor(() => {
          fireEvent.click(screen.getByRole('option', { name: mockSteps[1].options?.[0] || '' }));
        });
      }
      // For steps 3-4 and 7 (multiselect inputs), steps 5-6 (radio), step 8 (slider)
      else {
        if (i === 2 || i === 3 || i === 6) {
          const checkboxes = screen.getAllByRole('checkbox');
          fireEvent.click(checkboxes[0]);
        } else if (i === 4 || i === 5) {
          const radioButtons = screen.getAllByRole('radio');
          fireEvent.click(radioButtons[0]);
        } else if (i === 7) {
          const slider = screen.getByRole('slider');
          fireEvent.change(slider, { target: { value: 100 } });
        }
      }
      
      // Click Next to proceed to next step
      fireEvent.click(nextButton);
      
      // Wait for the next step to appear
      await waitFor(() => {
        expect(screen.getByText(mockSteps[i + 1].prompt)).toBeInTheDocument();
      });
    }
    
    // Now we should be on the 9th step (decision roles)
    // Verify radio buttons rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[8].prompt)).toBeInTheDocument();
      
      // Check all options are rendered
      mockSteps[8].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Check the radio buttons are rendered
      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons.length).toBe(mockSteps[8].options?.length || 0);
    });
    
    // Select "CIO (Chief Information Officer)" option
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[1]); // Select CIO option
    
    // Verify the radio value is selected
    expect(radioButtons[1]).toBeChecked();
    
    // Submit with radio selection
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    
    // Verify the saveAnswer call with the selected role
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: "CIO (Chief Information Officer)",
        skipped: false
      }));
    });
  });

  // Add a test for patient population multiselect
  test('should render and interact with patient population multiselect', async () => {
    render(<QuestionnaireWizard />);
    
    // Navigate through 9 steps to reach the 10th step (patient population)
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    // Submit all previous steps
    for (let i = 0; i < 9; i++) {
      // For step 1 (text input)
      if (i === 0) {
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Step answer' } });
      }
      // For step 2 (select input)
      else if (i === 1) {
        const selectTrigger = screen.getByRole('combobox');
        fireEvent.click(selectTrigger);
        await waitFor(() => {
          fireEvent.click(screen.getByRole('option', { name: mockSteps[1].options?.[0] || '' }));
        });
      }
      // For steps 3-4 and 7 (multiselect inputs), steps 5-6 and 9 (radio), step 8 (slider)
      else {
        if (i === 2 || i === 3 || i === 6) {
          const checkboxes = screen.getAllByRole('checkbox');
          fireEvent.click(checkboxes[0]);
        } else if (i === 4 || i === 5 || i === 8) {
          const radioButtons = screen.getAllByRole('radio');
          fireEvent.click(radioButtons[0]);
        } else if (i === 7) {
          const slider = screen.getByRole('slider');
          fireEvent.change(slider, { target: { value: 100 } });
        }
      }
      
      // Click Next to proceed to next step
      fireEvent.click(nextButton);
      
      // Wait for the next step to appear
      await waitFor(() => {
        expect(screen.getByText(mockSteps[i + 1].prompt)).toBeInTheDocument();
      });
    }
    
    // Now we should be on the 10th step (patient population)
    // Verify multiselect rendering
    await waitFor(() => {
      expect(screen.getByText(mockSteps[9].prompt)).toBeInTheDocument();
      
      // Check all options are rendered with checkboxes
      mockSteps[9].options?.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
      
      // Check the checkboxes are rendered
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(mockSteps[9].options?.length || 0);
    });
    
    // Select multiple options
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[2]); // Paediatric focus
    fireEvent.click(checkboxes[3]); // Geriatric focus
    
    // Submit with multiple selections
    fireEvent.click(screen.getByRole('button', { name: /finish/i }));
    
    // Verify the saveAnswer call with the multiple selections
    await waitFor(() => {
      const saveAnswer = (convexReact.useMutation as MockedFunction).mock.results[1].value;
      expect(saveAnswer).toHaveBeenCalled();
      expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({
        value: expect.arrayContaining([
          'Paediatric focus',
          'Geriatric focus'
        ]),
        skipped: false
      }));
    });
  });
}); 