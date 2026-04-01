"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitBranchIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomDialogHeader } from "@/components/uiii/CustomDialogHeader";
import { createArchitectureProject } from "@/lib/architecture/projects";
import {
  createArchitectureSchema,
  type CreateArchitectureSchemaType,
} from "@/schema/architecture";

export default function CreateArchitectureDialog({
  triggerText,
  triggerClassName,
}: {
  triggerText?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateArchitectureSchemaType>({
    resolver: zodResolver(createArchitectureSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (values: CreateArchitectureSchemaType) => {
    setIsSubmitting(true);
    toast.loading("Creating architecture...", { id: "create-architecture" });

    try {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 450);
      });

      const project = createArchitectureProject({
        name: values.name,
        description: values.description || undefined,
      });

      form.reset({
        name: "",
        description: "",
      });
      setOpen(false);
      toast.success("Architecture created", { id: "create-architecture" });
      router.push(`/architecture/editor/${project.id}`);
    } catch {
      toast.error("Failed to create architecture", { id: "create-architecture" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={triggerClassName}>{triggerText ?? "Create architecture"}</Button>
      </DialogTrigger>

      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={<GitBranchIcon />}
          title="Create architecture"
          subTitle="Start building your system design"
        />

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-xs text-primary">(required)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter architecture name" {...field} />
                    </FormControl>
                    <FormDescription>Choose a descriptive name for this architecture.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description{" "}
                      <span className="text-xs text-muted-foreground">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a short description..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Describe the system or cloud setup you want to model.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2Icon className="animate-spin" /> : "Create Architecture"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
