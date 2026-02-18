
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { FundCluster } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1, { message: "Fund cluster name is required." }),
});

type FundClusterFormValues = z.infer<typeof formSchema>;

interface FundClusterFormProps {
  fundCluster: FundCluster | null;
  onSubmit: (data: FundClusterFormValues, id?: string) => void;
  onCancel: () => void;
}

export function FundClusterForm({ fundCluster, onSubmit, onCancel }: FundClusterFormProps) {
  const form = useForm<FundClusterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: fundCluster
      ? {
          name: fundCluster.name,
        }
      : {
          name: "",
        },
  });

  const handleSubmit = (data: FundClusterFormValues) => {
    onSubmit(data, fundCluster?.id);
  };

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fund Cluster Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Regular Agency Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            {fundCluster ? "Save Changes" : "Add Fund Cluster"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
