import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { RangeSliderWithLabels } from '../src/components/ui/range-slider-with-labels';
import { VisualSelector } from '../src/components/ui/visual-selector';
import { CondensedCheckboxGrid } from '../src/components/ui/condensed-checkbox-grid';
import { HierarchicalSelect } from '../src/components/ui/hierarchical-select';

describe('Custom UI Components', () => {
  describe('RangeSliderWithLabels', () => {
    test('renders with proper labels', () => {
      render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25}
          labels={['None', 'Low', 'Medium', 'High', 'Critical']}
        />
      );

      // Check all labels are rendered
      expect(screen.getByText('None')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();

      // Verify slider exists
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    test('handles default values and value changes', () => {
      const onValueChange = vi.fn();
      render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25}
          labels={['None', 'Low', 'Medium', 'High', 'Critical']}
          defaultValue={[50]}
          onValueChange={onValueChange}
        />
      );

      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('50');
    });
  });

  describe('VisualSelector', () => {
    const options = [
      { value: 'heart', image: '/icons/heart.svg', label: 'Heart' },
      { value: 'brain', image: '/icons/brain.svg', label: 'Brain' },
      { value: 'lungs', image: '/icons/lungs.svg', label: 'Lungs' }
    ];

    test('renders options with images and labels', () => {
      render(<VisualSelector options={options} />);

      expect(screen.getByText('Heart')).toBeInTheDocument();
      expect(screen.getByText('Brain')).toBeInTheDocument();
      expect(screen.getByText('Lungs')).toBeInTheDocument();

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3);
    });

    test('handles selection in single mode', () => {
      const onChange = vi.fn();
      render(<VisualSelector options={options} onChange={onChange} />);

      fireEvent.click(screen.getByText('Heart'));
      expect(onChange).toHaveBeenCalledWith('heart');
    });

    test('handles multiple selection', () => {
      const onChange = vi.fn();
      render(<VisualSelector options={options} multiple={true} onChange={onChange} />);

      fireEvent.click(screen.getByText('Heart'));
      expect(onChange).toHaveBeenCalledWith(['heart']);

      fireEvent.click(screen.getByText('Brain'));
      expect(onChange).toHaveBeenCalledWith(['heart', 'brain']);
    });
  });

  describe('CondensedCheckboxGrid', () => {
    const rows = ['Morning', 'Afternoon', 'Evening'];
    const columns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    test('renders grid with rows and columns', () => {
      render(<CondensedCheckboxGrid rows={rows} columns={columns} />);

      // Check rows
      expect(screen.getByText('Morning')).toBeInTheDocument();
      expect(screen.getByText('Afternoon')).toBeInTheDocument();
      expect(screen.getByText('Evening')).toBeInTheDocument();

      // Check columns
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();

      // 15 checkboxes should be rendered (3 rows x 5 columns)
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(15);
    });

    test('handles checkbox selection', () => {
      const onChange = vi.fn();
      render(<CondensedCheckboxGrid rows={rows} columns={columns} onChange={onChange} />);

      // Get first checkbox (Morning - Mon)
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      expect(onChange).toHaveBeenCalled();
      const value = onChange.mock.calls[0][0];
      expect(value).toHaveProperty('Morning');
      expect(value.Morning).toContain('Mon');
    });
  });

  describe('HierarchicalSelect', () => {
    const options = [
      {
        label: 'Cardiology',
        children: [
          { value: 'general_cardiology', label: 'General Cardiology' },
          { value: 'interventional', label: 'Interventional Cardiology' }
        ]
      },
      {
        label: 'Neurology',
        children: [
          { value: 'general_neurology', label: 'General Neurology' },
          { value: 'stroke', label: 'Stroke' }
        ]
      }
    ];

    test('renders select button with placeholder', () => {
      render(<HierarchicalSelect options={options} placeholder="Select specialty..." />);

      expect(screen.getByRole('combobox')).toHaveTextContent('Select specialty...');
    });

    test('displays selected value', () => {
      render(
        <HierarchicalSelect
          options={options}
          value="general_cardiology"
        />
      );

      // Since the component flattens options for display, we expect it to show the full path
      const button = screen.getByRole('combobox');
      expect(button).toHaveTextContent('Cardiology > General Cardiology');
    });
  });
}); 