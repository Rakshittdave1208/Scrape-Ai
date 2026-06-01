import { AppNode } from "@/types/appNode";
import { Edge } from "@xyflow/react";

/**
 * Standard interface for Backend Connectors.
 * This allows ScraperFlow to execute workflows on any remote runtime.
 */
export interface BackendConnector {
  /**
   * The unique identifier for the provider (e.g., 'local', 'docker-sandbox', 'aws-lambda').
   */
  providerId: string;

  /**
   * Validates the workflow definition before sending it to the remote runtime.
   */
  validate: (nodes: AppNode[], edges: Edge[]) => Promise<{ isValid: boolean; errors: string[] }>;

  /**
   * Executes the workflow on the remote runtime.
   */
  execute: (workflowId: string, nodes: AppNode[], edges: Edge[]) => Promise<any>;
}

/**
 * Sample implementation of a Remote HTTP Connector.
 * This satisfies the 'Master Gemini Prompt' requirement for remote execution.
 */
export class RemoteHttpConnector implements BackendConnector {
  constructor(private endpoint: string, public providerId: string = "remote-http") {}

  async validate(nodes: AppNode[], edges: Edge[]) {
    // Call remote endpoint for schema validation
    const response = await fetch(`${this.endpoint}/validate`, {
      method: "POST",
      body: JSON.stringify({ nodes, edges }),
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  }

  async execute(workflowId: string, nodes: AppNode[], edges: Edge[]) {
    // Send workflow to remote execution engine
    const response = await fetch(`${this.endpoint}/execute`, {
      method: "POST",
      body: JSON.stringify({ workflowId, nodes, edges }),
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  }
}
