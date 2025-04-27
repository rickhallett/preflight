import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HierarchicalOption {
  label: string;
  value?: string;
  children?: HierarchicalOption[];
}

interface HierarchicalSelectProps {
  options: HierarchicalOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function HierarchicalSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
}: HierarchicalSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPath, setSelectedPath] = React.useState<string[]>([]);
  const [currentOptions, setCurrentOptions] = React.useState(options);
  const [breadcrumbs, setBreadcrumbs] = React.useState<string[]>([]);

  // Flatten options for searching and determining selected label
  const flattenedOptions = React.useMemo(() => {
    const flattened: { value: string; label: string; fullLabel: string }[] = [];

    const traverse = (opts: HierarchicalOption[], parentLabel = "") => {
      opts.forEach(opt => {
        if (opt.value) {
          const fullLabel = parentLabel ? `${parentLabel} > ${opt.label}` : opt.label;
          flattened.push({ value: opt.value, label: opt.label, fullLabel });
        }
        if (opt.children?.length) {
          traverse(opt.children, parentLabel ? `${parentLabel} > ${opt.label}` : opt.label);
        }
      });
    };

    traverse(options);
    return flattened;
  }, [options]);

  // Find the selected option's label
  const selectedLabel = React.useMemo(() => {
    if (!value) return "";
    const selectedOption = flattenedOptions.find(opt => opt.value === value);
    return selectedOption ? selectedOption.fullLabel : "";
  }, [value, flattenedOptions]);

  // Navigate to a child option group
  const navigateToChild = (option: HierarchicalOption) => {
    if (option.children?.length) {
      setCurrentOptions(option.children);
      setBreadcrumbs([...breadcrumbs, option.label]);
    } else if (option.value) {
      onChange?.(option.value);
      setOpen(false);
    }
  };

  // Navigate up one level
  const navigateUp = () => {
    if (breadcrumbs.length === 0) return;

    let currentLevel = options;
    const newBreadcrumbs = breadcrumbs.slice(0, -1);

    // Traverse to the correct level
    for (const crumb of newBreadcrumbs) {
      const nextLevel = currentLevel.find(opt => opt.label === crumb);
      if (nextLevel?.children) {
        currentLevel = nextLevel.children;
      }
    }

    setCurrentOptions(currentLevel);
    setBreadcrumbs(newBreadcrumbs);
  };

  // Reset navigation when opening popover
  React.useEffect(() => {
    if (open) {
      setCurrentOptions(options);
      setBreadcrumbs([]);
    }
  }, [open, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <span className="truncate">{selectedLabel}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandList>
            {breadcrumbs.length > 0 && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => navigateUp()}
                  className="cursor-pointer text-muted-foreground"
                >
                  ← Back to {breadcrumbs[breadcrumbs.length - 1]}
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {breadcrumbs.length > 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {breadcrumbs.join(" > ")}
                </div>
              )}
              {currentOptions.map((option) => (
                <CommandItem
                  key={option.label}
                  onSelect={() => navigateToChild(option)}
                  className="cursor-pointer"
                >
                  {option.value && value === option.value && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  <span>{option.label}</span>
                  {option.children?.length && (
                    <span className="ml-auto text-muted-foreground">→</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 