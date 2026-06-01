import { Separator } from "@radix-ui/react-dropdown-menu";
import { DialogHeader, DialogTitle } from "../ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  title?: string;
  subTitle?: string;
  icon?: React.ReactNode | React.ComponentType<any>; // <-- flexible

  iconClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function CustomDialogHeader(props: Props) {
  const Icon = props.icon;

  return (
    <DialogHeader className="py-6">
      <DialogTitle asChild>
        <div className="flex flex-col items-center gap-2 mb-2">

          {Icon && (
            // If it's a component function, render it
            typeof Icon === "function" ? (
              <Icon
                size={30}
                className={cn("stroke-primary", props.iconClassName)}
              />
            ) : (
              // If it's JSX, render it directly
              Icon
            )
          )}

          {props.title && (
            <p className={cn("text-xl text-primary", props.titleClassName)}>
              {props.title}
            </p>
          )}

          {props.subTitle && (
            <p className={cn("text-sm text-muted-foreground", props.subtitleClassName)}>
              {props.subTitle}
            </p>
          )}
        </div>
      </DialogTitle>

      <Separator />
    </DialogHeader>
  );
}
