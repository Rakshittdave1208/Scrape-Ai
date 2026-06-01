"use client";

import React, { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, PlusIcon, Trash2Icon, Code2Icon, GlobeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomNodeSchema, CreateCustomNodeSchemaType } from "@/schema/nodes";
import { TaskParamType } from "@/types/task";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  initialValues?: CreateCustomNodeSchemaType;
  onSubmit: (values: CreateCustomNodeSchemaType) => Promise<void>;
  submitText: string;
}

export default function CustomNodeForm({ initialValues, onSubmit, submitText }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateCustomNodeSchemaType>({
    resolver: zodResolver(createCustomNodeSchema) as any,
    defaultValues: initialValues || {
      name: "",
      label: "",
      icon: "Zap",
      category: "Custom Nodes",
      description: "",
      inputs: [],
      outputs: [],
      runtime: "api",
      code: "",
      config: "{}",
    },
  });

  const { fields: inputFields, append: appendInput, remove: removeInput } = useFieldArray({
    control: form.control,
    name: "inputs"
  });

  const { fields: outputFields, append: appendOutput, remove: removeOutput } = useFieldArray({
    control: form.control,
    name: "outputs"
  });

  const handleFormSubmit = (values: CreateCustomNodeSchemaType) => {
    startTransition(async () => {
      try {
        await onSubmit(values);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to process node");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none bg-secondary/50 p-1">
            <TabsTrigger value="basic" className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px]">Basic Info</TabsTrigger>
            <TabsTrigger value="schema" className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px]">IO Schema</TabsTrigger>
            <TabsTrigger value="execution" className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px]">Execution</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Internal Name</FormLabel>
                    <FormControl><Input placeholder="E.g. MY_CUSTOM_API" {...field} className="rounded-none border-border" /></FormControl>
                    <FormDescription className="text-[10px]">Must be uppercase with underscores.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Display Label</FormLabel>
                    <FormControl><Input placeholder="E.g. My Custom API" {...field} className="rounded-none border-border" /></FormControl>
                    <FormDescription className="text-[10px]">The name shown in the editor menu.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Description</FormLabel>
                  <FormControl><Textarea placeholder="What does this node do?" {...field} className="rounded-none resize-none border-border min-h-[80px]" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="schema" className="space-y-6 pt-4">
            {/* INPUTS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <PlusIcon size={14} className="text-primary" /> Inputs
                </h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => appendInput({ name: "", type: TaskParamType.STRING, required: true, hideHandle: false })} className="h-8 text-xs gap-1 hover:bg-primary/10">
                  Add Input
                </Button>
              </div>
              <div className="space-y-3">
                {inputFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start bg-secondary/20 p-2 border border-dashed border-border">
                    <FormField
                      control={form.control}
                      name={`inputs.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1"><FormControl><Input placeholder="Name" {...field} className="h-8 text-xs rounded-none border-border" /></FormControl></FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`inputs.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-8 text-xs rounded-none border-border"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-none border-border">
                              {Object.values(TaskParamType).map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInput(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2Icon size={14} /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* OUTPUTS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <PlusIcon size={14} className="text-primary" /> Outputs
                </h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => appendOutput({ name: "", type: TaskParamType.STRING, required: false, hideHandle: false })} className="h-8 text-xs gap-1 hover:bg-primary/10">
                  Add Output
                </Button>
              </div>
              <div className="space-y-3">
                {outputFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start bg-secondary/20 p-2 border border-dashed border-border">
                    <FormField
                      control={form.control}
                      name={`outputs.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1"><FormControl><Input placeholder="Name" {...field} className="h-8 text-xs rounded-none border-border" /></FormControl></FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`outputs.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger className="h-8 text-xs rounded-none border-border"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-none border-border">
                              {Object.values(TaskParamType).map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOutput(index)} className="h-8 w-8 text-destructive hover:bg-destructive/10"><Trash2Icon size={14} /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="execution" className="space-y-4 pt-4">
             <FormField
                control={form.control}
                name="runtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Runtime Engine</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger className="rounded-none border-border"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent className="rounded-none border-border">
                        <SelectItem value="api" className="gap-2">
                          <div className="flex items-center gap-2"><GlobeIcon size={14} /> <span>REST API Connector</span></div>
                        </SelectItem>
                        <SelectItem value="node" className="gap-2">
                          <div className="flex items-center gap-2"><Code2Icon size={14} /> <span>Node.js Runtime</span></div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[10px]">How should this node be executed?</FormDescription>
                  </FormItem>
                )}
              />

              {form.watch("runtime") === "api" ? (
                 <FormField
                  control={form.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">API Configuration (JSON)</FormLabel>
                      <FormControl><Textarea placeholder='{ "url": "https://api.example.com", "method": "POST" }' {...field} className="font-mono text-xs h-32 rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Execution Script</FormLabel>
                      <FormControl><Textarea placeholder="module.exports = async (inputs) => { ... }" {...field} className="font-mono text-xs h-48 rounded-none border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full rounded-none h-12 text-base font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : submitText}
        </Button>
      </form>
    </Form>
  );
}
