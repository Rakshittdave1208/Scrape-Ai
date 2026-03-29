"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3Icon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getCredentialForEdit } from "@/actions/credentials/getCredentialForEdit";
import { updateCredential } from "@/actions/credentials/updateCredential";
import {
  credentialTypeSchema,
  updateCredentialSchema,
  type UpdateCredentialSchemaType,
} from "@/schema/credentials";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CustomDialogHeader } from "@/components/uiii/CustomDialogHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CredentialSecretPayload, CredentialSummary } from "./shared";

const credentialTypes = credentialTypeSchema.options;

function getDefaultValues(credential: CredentialSummary): UpdateCredentialSchemaType {
  return {
    id: credential.id,
    name: credential.name,
    type: credential.type as UpdateCredentialSchemaType["type"],
    description: credential.description ?? "",
    apiKey: "",
    username: credential.username ?? "",
    password: "",
    cookieValue: "",
    customHeaders: "",
  };
}

function toFormValues(credential: CredentialSecretPayload): UpdateCredentialSchemaType {
  return {
    id: credential.id,
    name: credential.name,
    type: credential.type as UpdateCredentialSchemaType["type"],
    description: credential.description ?? "",
    apiKey: credential.apiKey ?? "",
    username: credential.username ?? "",
    password: credential.password ?? "",
    cookieValue: credential.cookieValue ?? "",
    customHeaders: credential.customHeaders ?? "",
  };
}

export default function EditCredentialDialog({
  credential,
}: {
  credential: CredentialSummary;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSecret, startLoadingSecret] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateCredentialSchemaType>({
    resolver: zodResolver(updateCredentialSchema),
    defaultValues: getDefaultValues(credential),
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (!open) {
      form.reset(getDefaultValues(credential));
      return;
    }

    startLoadingSecret(async () => {
      try {
        const secureCredential = await getCredentialForEdit(credential.id);
        form.reset(toFormValues(secureCredential));
      } catch (error) {
        toast.error("Failed to load credential", { id: `load-${credential.id}` });
        setOpen(false);
      }
    });
  }, [credential, form, open]);

  const onSubmit = useCallback(
    (values: UpdateCredentialSchemaType) => {
      toast.loading("Updating credential...", { id: credential.id });

      startTransition(async () => {
        try {
          await updateCredential(values);
          toast.success("Credential updated", { id: credential.id });
          setOpen(false);
          router.refresh();
        } catch (error) {
          toast.error("Failed to update credential", { id: credential.id });
        }
      });
    },
    [credential.id, router]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={<Edit3Icon />}
          title="Edit credential"
          subTitle="Update the stored secret metadata or value"
        />
        <div className="p-6">
          {isLoadingSecret ? (
            <div className="flex min-h-48 items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                          {...field}
                        >
                          {credentialTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedType === "API_KEY" && (
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API key</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-28 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedType === "USERNAME_PASSWORD" && (
                  <>
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {selectedType === "COOKIE" && (
                  <FormField
                    control={form.control}
                    name="cookieValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cookie value</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-28 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedType === "CUSTOM_HEADER" && (
                  <FormField
                    control={form.control}
                    name="customHeaders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom headers</FormLabel>
                        <FormControl>
                          <Textarea className="min-h-28 resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={isPending || isLoadingSecret}>
                  {isPending ? <Loader2 className="animate-spin" /> : "Save Changes"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
