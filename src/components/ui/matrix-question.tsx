import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComplexQuestionComponent } from "./complex-question";
import { useFormContext } from "react-hook-form";

interface MatrixQuestionProps {
  fieldName: string;
  question: {
    prompt: string;
    components?: Array<{
      id: string;
      label: string;
      options?: string[];
    }>;
  };
}

export function MatrixQuestion({ fieldName, question }: MatrixQuestionProps) {
  const form = useFormContext();

  // Extract rows and columns from components
  // Typically, first component defines rows, second defines columns
  const rows = question.components?.[0]?.options || [];
  const columns = question.components?.[1]?.options || [];

  if (rows.length === 0 || columns.length === 0) {
    return (
      <div className="text-red-500">
        Error: Matrix question requires both rows and columns to be defined
      </div>
    );
  }

  return (
    <ComplexQuestionComponent fieldName={fieldName} question={question}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]"></TableHead>
              {columns.map((column) => (
                <TableHead key={column} className="text-center">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row}>
                <TableCell className="font-medium">{row}</TableCell>
                {columns.map((column) => {
                  const cellFieldName = `${fieldName}_${row.replace(/\s+/g, '_')}_${column.replace(/\s+/g, '_')}`;

                  return (
                    <TableCell key={`${row}_${column}`} className="text-center">
                      <FormField
                        control={form.control}
                        name={cellFieldName}
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-center space-y-0">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row space-y-0"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="selected"
                                    id={`${cellFieldName}-radio`}
                                    className="mx-auto"
                                  />
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ComplexQuestionComponent>
  );
} 