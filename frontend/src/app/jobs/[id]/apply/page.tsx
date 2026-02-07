"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jobApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [jobTitle, setJobTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cover_letter: "",
    email: session?.user?.email || "",
    subscribed: true,
  });

  useEffect(() => {
    if (!session) {
      toast.error("Please login to apply");
      router.push("/login");
      return;
    }

    // Fetch job title
    const fetchJob = async () => {
      try {
        const response = await jobApi.get(`/api/jobs/${params.id}`);
        setJobTitle(response.data.title);
      } catch (error) {
        toast.error("Failed to load job details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [session, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await jobApi.post("/api/applications", {
        job_id: params.id,
        cover_letter: formData.cover_letter,
        email: formData.email,
        subscribed: formData.subscribed,
      });

      toast.success("Application submitted successfully!", {
        description: "The recruiter will review your application soon.",
      });

      // Redirect to my applications
      router.push("/dashboard/applications");
    } catch (error: any) {
      const message = error.response?.data?.error || "Failed to submit application";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          ← Back to Job
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Apply for Position</CardTitle>
            <CardDescription className="text-lg">{jobTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="your.email@example.com"
                />
                <p className="text-xs text-gray-500">
                  We'll send updates about your application to this email
                </p>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label htmlFor="cover_letter">Cover Letter *</Label>
                <Textarea
                  id="cover_letter"
                  value={formData.cover_letter}
                  onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                  required
                  rows={8}
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Minimum 50 characters
                </p>
              </div>

              {/* Subscribe to Updates */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="subscribed"
                  checked={formData.subscribed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, subscribed: checked as boolean })
                  }
                />
                <label
                  htmlFor="subscribed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send me email updates when my application status changes
                </label>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 <strong>Tip:</strong> Make sure your resume is up to date in your profile before applying.
                  Recruiters will review your profile to learn more about you.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || formData.cover_letter.length < 50}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
