"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  location: string;
  created_at: string;
}

export default function CompaniesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "recruiter") {
      toast.error("Access denied");
      router.push("/");
      return;
    }

    fetchCompanies();
  }, [session, router]);

  const fetchCompanies = async () => {
    try {
      const response = await jobApi.get("/api/companies");
      setCompanies(response.data.companies || []);
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCompany) {
        await jobApi.put(`/api/companies/${editingCompany.id}`, formData);
        toast.success("Company updated successfully");
      } else {
        await jobApi.post("/api/companies", formData);
        toast.success("Company created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save company");
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description,
      website: company.website,
      location: company.location,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      await jobApi.delete(`/api/companies/${id}`);
      toast.success("Company deleted successfully");
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete company");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", website: "", location: "" });
    setEditingCompany(null);
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Companies</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your company profiles
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCompany ? "Edit Company" : "Create New Company"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the company details below
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    {editingCompany ? "Update" : "Create"} Company
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies List */}
        {companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Building2 className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No companies yet
              </p>
              <p className="text-gray-500 mb-6">
                Create a company to start posting jobs
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </CardTitle>
                  <CardDescription>{company.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {company.description}
                  </p>
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block mb-4"
                    >
                      Visit website
                    </a>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => router.push(`/companies/${company.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(company)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(company.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
