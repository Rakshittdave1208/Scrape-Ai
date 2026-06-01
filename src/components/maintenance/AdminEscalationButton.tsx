"use client";

import { escalateToAdmin } from "@/actions/maintenance/escalate";
import { Button } from "@/components/ui/button";
import { ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminEscalationButton() {
  const handleEscalate = async () => {
    try {
      const result = await escalateToAdmin();
      toast.success(result.message);
    } catch (error) {
      toast.error("Escalation failed. Check server logs.");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleEscalate}
      className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white"
    >
      <ShieldAlertIcon size={14} />
      Dev: Escalate to Admin
    </Button>
  );
}
