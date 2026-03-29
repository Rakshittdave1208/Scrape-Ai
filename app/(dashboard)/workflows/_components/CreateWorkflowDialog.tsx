
"use client";

import React, { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomDialogHeader } from "@/components/uiii/CustomDialogHeader";
import { Layers2Icon, Loader2 } from "lucide-react";

import {
  createWorkflowSchema,
  type CreateWorkflowSchemaType,
} from "@/schema/workflow";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import { useMutation } from "@tanstack/react-query";
import { CreateWorkflow } from "@/actions/workflows/createWorkflow";

import { toast } from "sonner";

export default function CreateWorkflowDialog({
  triggerText,
}: {
  triggerText?: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateWorkflowSchemaType>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  /* ------------------- MUTATION ------------------- */

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await CreateWorkflow(formData);
    },

    onSuccess: () => {
      toast.success("Workflow Created", { id: "create-workflow" });

      form.reset({
        name: "",
        description: "",
      });

      setOpen(false);
    },

    onError: (error) => {
      toast.error("Failed to create workflow", { id: "create-workflow" });
    },
  });

  /* ------------------- SUBMIT ------------------- */

  const onSubmit = useCallback(
    (values: CreateWorkflowSchemaType) => {
      toast.loading("Creating Workflow...", { id: "create-workflow" });

      const formData = new FormData();
      formData.append("name", values.name);

      if (values.description) {
        formData.append("description", values.description);
      }

      mutate(formData);
    },
    [mutate]
  );

  /* ------------------- UI ------------------- */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{triggerText ?? "Create workflow"}</Button>
      </DialogTrigger>

      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={<Layers2Icon />}
          title="Create workflow"
          subTitle="Start building your workflow"
        />

        <div className="p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full"
            >
              {/* NAME FIELD */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className="text-xs text-primary">(required)</span>
                    </FormLabel>

                    <FormControl>
                      <Input placeholder="Enter workflow name" {...field} />
                    </FormControl>

                    <FormDescription>
                      Choose a descriptive and unique name
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DESCRIPTION FIELD */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>

                    <FormControl>
                      <Textarea
                        placeholder="Write a short description..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>

                    <FormDescription>
                      Provide a brief description of your workflow.
                    </FormDescription>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={isPending}
              >
                {!isPending && "Create Workflow"}
                {isPending && <Loader2 className="animate-spin" />}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

