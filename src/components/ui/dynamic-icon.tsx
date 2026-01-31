import { LucideProps, icons, SquareDashed } from "lucide-react";
import { memo } from "react";

export type IconName = keyof typeof icons;

export interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: IconName;
}

/**
 * DynamicIcon component that renders a Lucide icon based on its name.
 *
 * @example
 * <DynamicIcon name="Camera" className="h-4 w-4" />
 *
 * @param name - The name of the icon to render (case-sensitive, e.g., "Camera", "Video", "Music")
 * @param fallback - Optional fallback icon name if the primary name is not found
 */
export const DynamicIcon = memo(
  ({ name, fallback, ...props }: DynamicIconProps) => {
    // Try the provided name first
    let Icon = icons[name as IconName];

    // If not found, try title-casing it (lucide uses PascalCase for icons in the object)
    if (!Icon && name) {
      const pascalName = (name.charAt(0).toUpperCase() +
        name.slice(1)) as IconName;
      Icon = icons[pascalName];
    }

    // If still not found and fallback is provided
    if (!Icon && fallback) {
      Icon = icons[fallback];
    }

    if (!Icon) {
      return <SquareDashed {...props} />;
    }

    return <Icon {...props} />;
  },
);

DynamicIcon.displayName = "DynamicIcon";
