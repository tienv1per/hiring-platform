"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { jobApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Loader2, Plus, Pencil, Trash2, Building2, MapPin, Globe, ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  location: string;
  created_at: string;
  logo_url?: string;
  industry?: string;
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
    industry: "",
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
      industry: company.industry || "",
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
    setFormData({ name: "", description: "", website: "", location: "", industry: "" });
    setEditingCompany(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Companies</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and update your company profiles.</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="shadow-lg shadow-blue-500/20 gap-2">
                  <Plus className="h-4 w-4" /> Add Company
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl">{editingCompany ? "Edit Company" : "Create New Company"}</DialogTitle>
                  <DialogDescription>
                    Fill in the details to {editingCompany ? "update" : "create"} your company profile.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g. Technology"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                      placeholder="Tell us about your company..."
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{editingCompany ? "Update" : "Create"} Company</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {companies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">No companies yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">Create your first company profile to start posting jobs and managing your employer brand.</p>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="mt-6" variant="outline">
              Create First Company
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {companies.map((company) => (
              <motion.div variants={itemVariants} key={company.id}>
                <Card className="h-full hover:shadow-xl hover:border-blue-500 transition-all group duration-300 flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={company.name} className="h-8 w-8 object-contain" />
                        ) : (
                          <Building2 className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(company)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(company.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => router.push(`/companies/${company.id}`)}>
                      {company.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {company.location}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {company.description}
                    </p>
                    {company.industry && (
                      <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10">
                        {company.industry}
                      </span>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-auto flex justify-between">
                    {company.website && (
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        <Globe className="h-3.5 w-3.5" /> Website
                      </a>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push(`/companies/${company.id}`)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-1 ml-auto"
                    >
                      View Details <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
