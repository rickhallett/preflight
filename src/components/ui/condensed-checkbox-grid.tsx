import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface CondensedCheckboxGridProps {
  rows: string[];
  columns: string[];
  value?: Record<string, string[]>;
  onChange?: (value: Record<string, string[]>) => void;
  className?: string;
}

export function CondensedCheckboxGrid({
  rows,
  columns,
  value = {},
  onChange,
  className,
}: CondensedCheckboxGridProps) {
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string[]>>(value);

  const toggleValue = (row: string, column: string) => {
    const rowValues = selectedValues[row] || [];
    let newRowValues: string[];

    if (rowValues.includes(column)) {
      // Remove the column if already selected
      newRowValues = rowValues.filter(c => c !== column);
    } else {
      // Add the column if not selected
      newRowValues = [...rowValues, column];
    }

    const newSelectedValues = {
      ...selectedValues,
      [row]: newRowValues
    };

    // Remove empty rows
    if (newRowValues.length === 0) {
      delete newSelectedValues[row];
    }

    setSelectedValues(newSelectedValues);
    onChange?.(newSelectedValues);
  };

  const isSelected = (row: string, column: string) => {
    return (selectedValues[row] || []).includes(column);
  };

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border-b"></th>
            {columns.map(column => (
              <th key={column} className="p-2 border-b text-center text-sm font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row}>
              <td className="p-2 border-b font-medium text-sm">
                {row}
              </td>
              {columns.map(column => (
                <td key={`${row}-${column}`} className="p-2 border-b text-center">
                  <Checkbox
                    id={`${row}-${column}`}
                    checked={isSelected(row, column)}
                    onCheckedChange={() => toggleValue(row, column)}
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 