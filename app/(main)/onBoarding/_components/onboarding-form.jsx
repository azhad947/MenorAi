"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { industries } from "@/data/industries";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-Fetch";
import { updateUser } from "@/actions/user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const OnboardingForm = () => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
  });
  const watchIndustry = watch("industry");
  const { data: updatedData, fn, loading } = useFetch(updateUser);
  const onSubmit = async (data) => {
    try {
      const formatIndustry = `${data.industry}-${data.subIndustry}`
        .toLowerCase()
        .replace(/ /g, "-");

      const send = await fn({
        ...data,
        industry: formatIndustry,
      });

      console.log(send);
      router.push("/dashboard");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };
  useEffect(() => {
    if (updatedData?.success && !loading) {
      toast.success("Profile completed successfully");
      router.push("/dashboard");
      router.refresh();
    }
  }, [updatedData, loading]);

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className="gradient-title">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Select Your Industry to get personalized career Insight and
            recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(val) => {
                  setValue("industry", val);
                  setSelectedIndustry(industries.find((ind) => ind.id === val));
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select The Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.id} value={ind.id}>
                      {ind.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-red-500">{errors.industry.message}</p>
              )}
            </div>

            {watchIndustry && (
              <div className="space-y-3">
                <Label htmlFor="subIndustry">SubIndustry</Label>
                <Select
                  onValueChange={(val) => {
                    setValue("subIndustry", val);
                  }}
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry.subIndustries?.map((sub, index) => (
                      <SelectItem key={index} value={sub}>
                        {sub}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subIndustry && (
                  <p className="text-red-500">{errors.subIndustry.message}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of experience"
                {...register("experience")}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., Python, JavaScript, Project Management"
                {...register("skills")}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple skills with commas
              </p>
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background..."
                className="h-32"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-red-500">{errors.bio.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disable={loading}>
              {loading ? (
                <>
                  
                  <Loader2 className="mr-2   h-4 w-4 " /> Saving{" "}
                </>
              ) : (
                "Submit Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
