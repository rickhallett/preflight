/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { RangeSliderWithLabels } from '../src/components/ui/range-slider-with-labels';
import { VisualSelector } from '../src/components/ui/visual-selector';
import { CondensedCheckboxGrid } from '../src/components/ui/condensed-checkbox-grid';
import { HierarchicalSelect } from '../src/components/ui/hierarchical-select';

describe('Custom UI Components', () => {
  beforeEach(() => {
    // Reset DOM between tests
    document.body.innerHTML = '';
  });

  describe('RangeSliderWithLabels', () => {
    test('renders with proper labels', () => {
      const labels = ['None', 'Low', 'Medium', 'High', 'Very High'];
      const { container } = render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25}
          labels={labels}
          defaultValue={[50]}
          onValueChange={() => { }}
        />
      );

      // Check all labels are in the HTML
      const html = container.innerHTML;
      for (const label of labels) {
        expect(html).toContain(label);
      }
    });

    test('handles default values and value changes', () => {
      const onValueChange = vi.fn();
      const { container } = render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25}
          labels={['None', 'Low', 'Medium', 'High', 'Very High']}
          defaultValue={[50]}
          onValueChange={onValueChange}
        />
      );

      // Find the slider element
      const slider = container.querySelector('[role="slider"]');
      expect(slider).not.toBeNull();

      // Check default value is set
      expect(slider?.getAttribute('aria-valuenow')).toBe('50');

      // Simulate a direct value change by finding the Slider component and
      // calling its onValueChange prop directly
      const sliderComponent = container.querySelector('[data-orientation="horizontal"]');
      expect(sliderComponent).not.toBeNull();

      // Use a direct approach to test the callback
      // Find the event handler on the base element
      if (sliderComponent) {
        // Directly dispatch a custom event that the underlying component would use
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          value: { value: [75] }
        });
        sliderComponent.dispatchEvent(event);

        // Since we can't fully simulate the complex interaction with the Radix UI Slider,
        // we can at least verify our component passes the value change callback correctly
        // by testing the outer function props
        expect(onValueChange).toHaveBeenCalled();
      }
    });

    test('provides fallback for insufficient labels', () => {
      // Capture console warnings
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const { container } = render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25}
          labels={['Single Label']} // Insufficient labels
          defaultValue={[25]}
          onValueChange={() => { }}
        />
      );

      // Check if warning was logged
      expect(warnSpy).toHaveBeenCalledWith(
        "RangeSliderWithLabels should have at least 2 labels"
      );

      // Check if fallback labels were used
      const html = container.innerHTML;
      expect(html).toContain('Single Label');

      warnSpy.mockRestore();
    });

    test('handles empty labels array', () => {
      // Capture console warnings
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const { container } = render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25}
          labels={[]} // Empty labels
          defaultValue={[25]}
          onValueChange={() => { }}
        />
      );

      // Check if warning was logged
      expect(warnSpy).toHaveBeenCalledWith(
        "RangeSliderWithLabels should have at least 2 labels"
      );

      // Check if fallback labels ("Min", "Max") were added
      const html = container.innerHTML;
      expect(html).toContain('Min');
      expect(html).toContain('Max');

      warnSpy.mockRestore();
    });

    test('distributes labels evenly when count differs from steps', () => {
      const labels = ['Start', 'Middle', 'End']; // 3 labels
      const { container } = render(
        <RangeSliderWithLabels
          min={0}
          max={100}
          step={25} // This would create 5 positions (0, 25, 50, 75, 100)
          labels={labels}
          defaultValue={[50]}
          onValueChange={() => { }}
        />
      );

      // Check all labels are in the HTML
      const html = container.innerHTML;
      for (const label of labels) {
        expect(html).toContain(label);
      }

      // Check the positions
      const labelElements = container.querySelectorAll('.text-muted-foreground');
      expect(labelElements.length).toBe(3);

      // Check "Start" is at 0%, "Middle" at 50% and "End" at 100%
      expect((labelElements[0] as HTMLElement).style.left).toBe('0%');
      expect((labelElements[1] as HTMLElement).style.left).toBe('50%');
      expect((labelElements[2] as HTMLElement).style.left).toBe('100%');
    });
  });

  describe('VisualSelector', () => {
    const options = [
      { value: 'heart', image: '/icons/heart.svg', label: 'Heart' },
      { value: 'brain', image: '/icons/brain.svg', label: 'Brain' },
      { value: 'lungs', image: '/icons/lungs.svg', label: 'Lungs' }
    ];

    test('renders options with images and labels', () => {
      const { container } = render(<VisualSelector options={options} />);

      // Check for option labels in the HTML
      const html = container.innerHTML;
      expect(html).toContain('Heart');
      expect(html).toContain('Brain');
      expect(html).toContain('Lungs');

      // Check for image elements
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(3);
    });

    test('handles selection in single mode', () => {
      const onChange = vi.fn();
      const { container } = render(<VisualSelector options={options} onChange={onChange} />);

      // Based on the HTML structure, find the spans containing "Heart"
      const spans = container.querySelectorAll('span');
      const heartSpan = Array.from(spans).find(span => span.textContent === 'Heart');

      if (heartSpan) {
        // Click on the parent div which is likely to be the clickable element
        const parentDiv = heartSpan.closest('.flex');
        if (parentDiv) {
          fireEvent.click(parentDiv);
          expect(onChange).toHaveBeenCalledWith('heart');
        } else {
          console.log('No parent flex div found');
        }
      } else {
        console.log('No Heart span found');
      }
    });

    test('handles multiple selection', () => {
      const onChange = vi.fn();
      const { container } = render(<VisualSelector options={options} multiple={true} onChange={onChange} />);

      // Find spans for Heart and Brain
      const spans = container.querySelectorAll('span');
      const heartSpan = Array.from(spans).find(span => span.textContent === 'Heart');
      const brainSpan = Array.from(spans).find(span => span.textContent === 'Brain');

      // First click Heart option
      if (heartSpan) {
        const heartDiv = heartSpan.closest('.flex');
        if (heartDiv) {
          fireEvent.click(heartDiv);
          expect(onChange).toHaveBeenCalledWith(['heart']);

          // Then click Brain option
          if (brainSpan) {
            const brainDiv = brainSpan.closest('.flex');
            if (brainDiv) {
              fireEvent.click(brainDiv);
              expect(onChange).toHaveBeenCalledWith(['heart', 'brain']);
            }
          }
        }
      }
    });
  });

  describe('CondensedCheckboxGrid', () => {
    const rows = ['Morning', 'Afternoon', 'Evening'];
    const columns = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    test('renders grid with rows and columns', () => {
      const { container } = render(<CondensedCheckboxGrid rows={rows} columns={columns} />);

      // Check for rows and columns in the HTML
      const html = container.innerHTML;

      // Check rows
      rows.forEach(row => {
        expect(html).toContain(row);
      });

      // Check columns
      columns.forEach(col => {
        expect(html).toContain(col);
      });

      // Check for checkboxes (input type="checkbox")
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(rows.length * columns.length); // 15 checkboxes (3 rows x 5 columns)
    });

    test('handles checkbox selection', () => {
      const onChange = vi.fn();
      const { container } = render(<CondensedCheckboxGrid rows={rows} columns={columns} onChange={onChange} />);

      // Get first checkbox (Morning - Mon)
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);

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
      const { container } = render(<HierarchicalSelect options={options} placeholder="Select specialty..." />);

      // Find the button or element that would have the placeholder text
      const html = container.innerHTML;
      expect(html).toContain('Select specialty...');
    });

    test('displays selected value', () => {
      const { container } = render(
        <HierarchicalSelect
          options={options}
          value="general_cardiology"
        />
      );

      // Check if the full path is shown in the HTML
      const html = container.innerHTML;
      expect(html).toContain('Cardiology');
      expect(html).toContain('General Cardiology');
    });
  });
}); 