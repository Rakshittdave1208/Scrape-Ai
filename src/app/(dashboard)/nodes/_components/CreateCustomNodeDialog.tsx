"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomDialogHeader } from "@/components/uiii/CustomDialogHeader";
import { SparklesIcon } from "lucide-react";
import { CreateCustomNodeSchemaType } from "@/schema/nodes";
import { createCustomNode } from "@/actions/nodes/createCustomNode";
import { toast } from "sonner";
import CustomNodeForm from "./CustomNodeForm";

export default function CreateCustomNodeDialog({ triggerText }: { triggerText?: string }) {
  const [open, setOpen] = useState(false);

  const onSubmit = async (values: CreateCustomNodeSchemaType) => {
    toast.loading("Registering Custom Node...", { id: "create-node" });
    try {
      await createCustomNode(values);
      toast.success("Node Created Successfully", { id: "create-node" });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create node", { id: "create-node" });
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none shadow-lg">
          <SparklesIcon size={16} />
          {triggerText ?? "Create Custom Node"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-none border-border">
        <CustomDialogHeader
          icon={<SparklesIcon className="text-primary" />}
          title="Create Personal Node"
          subTitle="Design a dynamic, reusable node for your workflows."
        />

        <div className="p-6">
          <CustomNodeForm 
            onSubmit={onSubmit} 
            submitText="Deploy Personal Node" 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
