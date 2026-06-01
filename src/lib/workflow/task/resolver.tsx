import * as LucideIcons from "lucide-react";
import { TaskCategory, TaskParam, TaskType, WorkflowTask } from "@/types/task";
import { CustomNode } from "@/lib/generated/prisma";

/**
 * Resolver for Dynamic Personal Nodes.
 * Converts DB-stored CustomNode definitions into executable WorkflowTask objects.
 */
export function resolveCustomNode(node: CustomNode): WorkflowTask {
  // 1. Resolve Icon
  const IconComponent = (LucideIcons as any)[node.icon] || LucideIcons.HelpCircle;

  // 2. Parse JSON fields
  const inputs: TaskParam[] = JSON.parse(node.inputs);
  const outputs: TaskParam[] = JSON.parse(node.outputs);

  return {
    type: node.name, // Use the unique name as the type
    nodeType: "apiNode", // Default to apiNode for custom integrations
    label: node.label,
    icon: IconComponent,
    category: node.category as TaskCategory,
    description: node.description || undefined,
    inputs,
    outputs,
    credits: 10, // Base cost for custom nodes
    
    // Dynamic Execution Logic (The "Pipeline" Bridge)
    run: async (resolvedInputs: Record<string, unknown>) => {
      if (node.runtime === "api") {
        return await executeApiNode(node, resolvedInputs);
      }
      if (node.runtime === "node") {
        return await executeScriptNode(node, resolvedInputs);
      }
      return {};
    }
  };
}

/**
 * Pipeline for Remote API Node Execution
 */
async function executeApiNode(node: CustomNode, inputs: Record<string, unknown>) {
  const config = JSON.parse(node.config || "{}");
  
  // Logic to handle OpenAPI/REST call
  console.log(`Executing API Node ${node.name} via ${config.method} to ${config.url}`);
  
  // Placeholder for real fetch logic
  return {
    responseBody: { success: true, message: "API call simulated" }
  };
}

/**
 * Pipeline for Script Node Execution (Sandboxed)
 */
async function executeScriptNode(node: CustomNode, inputs: Record<string, unknown>) {
  console.log(`Executing Script Node ${node.name} with runtime ${node.runtime}`);
  
  // This would typically involve a VM2 or Docker sandbox call
  return {
    result: "Script execution simulated"
  };
}
