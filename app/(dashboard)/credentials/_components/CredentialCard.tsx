"use client";

import { useState } from "react";
import {
  BadgeInfoIcon,
  CookieIcon,
  FileJsonIcon,
  KeyRoundIcon,
  ShieldEllipsisIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DeleteCredentialDialog from "./DeleteCredentialDialog";
import EditCredentialDialog from "./EditCredentialDialog";
import {
  formatCredentialType,
  maskCredentialValue,
  type CredentialSummary,
} from "./shared";

function getCredentialIcon(type: string) {
  switch (type) {
    case "API_KEY":
      return KeyRoundIcon;
    case "USERNAME_PASSWORD":
      return UserRoundIcon;
    case "COOKIE":
      return CookieIcon;
    case "CUSTOM_HEADER":
      return FileJsonIcon;
    default:
      return ShieldEllipsisIcon;
  }
}

export default function CredentialCard({
  credential,
}: {
  credential: CredentialSummary;
}) {
  const [open, setOpen] = useState(false);
  const Icon = getCredentialIcon(credential.type);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{credential.name}</CardTitle>
            <Badge variant="outline">{formatCredentialType(credential.type)}</Badge>
          </div>
          <div className="rounded-full border p-2 text-muted-foreground">
            <Icon size={16} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="rounded-md border bg-secondary/30 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Masked value</p>
          <p className="mt-2 text-lg font-semibold tracking-[0.3em]">{maskCredentialValue()}</p>
        </div>

        {credential.type === "USERNAME_PASSWORD" && credential.username && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Username</p>
            <p className="text-sm text-foreground">{credential.username}</p>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</p>
          <p className="text-sm text-muted-foreground">
            {credential.description || "No description provided yet."}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <EditCredentialDialog credential={credential} />
        <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
          <Trash2Icon size={14} />
          Delete
        </Button>
      </CardFooter>

      <DeleteCredentialDialog
        open={open}
        setOpen={setOpen}
        credentialId={credential.id}
        credentialName={credential.name}
      />
    </Card>
  );
}
