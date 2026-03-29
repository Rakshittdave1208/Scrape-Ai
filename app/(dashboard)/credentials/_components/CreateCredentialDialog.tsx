"use client";

import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRoundIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createCredential } from "@/actions/credentials/createCredential";
import {
  createCredentialSchema,
  type CreateCredentialSchemaType,
  credentialTypeSchema,
} from "@/schema/credentials";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CustomDialogHeader } from "@/components/uiii/CustomDialogHeader";
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

const credentialTypes = credentialTypeSchema.options;

export default function CreateCredentialDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateCredentialSchemaType>({
    resolver: zodResolver(createCredentialSchema),
    defaultValues: {
      name: "",
      type: "API_KEY",
      description: "",
      apiKey: "",
      username: "",
      password: "",
      cookieValue: "",
      customHeaders: "",
    },
  });
  const selectedType = form.watch("type");

  const onSubmit = useCallback(
    (values: CreateCredentialSchemaType) => {
      toast.loading("Creating credential...", { id: "create-credential" });

      startTransition(async () => {
        try {
          await createCredential(values);
          toast.success("Credential created", { id: "create-credential" });
          form.reset({
            name: "",
            type: "API_KEY",
            description: "",
            apiKey: "",
            username: "",
            password: "",
            cookieValue: "",
            customHeaders: "",
          });
          setOpen(false);
          router.refresh();
        } catch (error) {
          toast.error("Failed to create credential", { id: "create-credential" });
        }
      });
    },
    [form, router]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <KeyRoundIcon size={16} />
          Add Credential
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0">
        <CustomDialogHeader
          icon={<KeyRoundIcon />}
          title="Add credential"
          subTitle="Store a secret securely for your workflows"
        />
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Production API key" {...field} />
                    </FormControl>
                    <FormDescription>Choose a clear label you will recognize later.</FormDescription>
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
                      <Textarea
                        placeholder="What this credential is used for"
                        className="resize-none"
                        {...field}
                      />
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
                        <Textarea
                          placeholder="Paste the API key here"
                          className="min-h-28 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>The UI will mask this API key in cards and lists.</FormDescription>
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
                          <Input placeholder="account@example.com" {...field} />
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
                          <Input type="password" placeholder="Enter the password" {...field} />
                        </FormControl>
                        <FormDescription>The card will mask the password value.</FormDescription>
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
                        <Textarea
                          placeholder="session=abc123; path=/; HttpOnly"
                          className="min-h-28 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Store the cookie string exactly as provided.</FormDescription>
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
                        <Textarea
                          placeholder='Authorization: Bearer token&#10;X-Trace-Id: abc123'
                          className="min-h-28 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Store the headers text or JSON you want to reuse.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="animate-spin" /> : "Create Credential"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
