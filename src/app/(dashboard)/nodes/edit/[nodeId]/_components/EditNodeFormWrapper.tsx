"use client";

import React from "react";
import { CustomNode } from "@/lib/generated/prisma";
import CustomNodeForm from "../../_components/CustomNodeForm";
import { CreateCustomNodeSchemaType } from "@/schema/nodes";
import { updateCustomNode } from "@/actions/nodes/updateCustomNode";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function EditNodeFormWrapper({ node }: { node: CustomNode }) {
  const router = useRouter();

  const initialValues: CreateCustomNodeSchemaType = {
    name: node.name,
    label: node.label,
    icon: node.icon,
    category: node.category,
    description: node.description || "",
    inputs: JSON.parse(node.inputs),
    outputs: JSON.parse(node.outputs),
    runtime: node.runtime as any,
    code: node.code || "",
    config: node.config || "{}",
  };

  const onSubmit = async (values: CreateCustomNodeSchemaType) => {
    toast.loading("Updating Custom Node...", { id: "update-node" });
    try {
      await updateCustomNode(node.id, values);
      toast.success("Node Updated Successfully", { id: "update-node" });
      router.push("/nodes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update node", { id: "update-node" });
      throw error;
    }
  };

  return (
    <CustomNodeForm 
      initialValues={initialValues} 
      onSubmit={onSubmit} 
      submitText="Update Personal Node" 
    />
  );
}
