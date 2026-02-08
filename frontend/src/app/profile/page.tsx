"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, X, Upload } from "lucide-react";
import { ColorPicker } from "@/components/color-picker";
import { getSkillColorClasses, type SkillColor } from "@/lib/skill-colors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bio: string;
  resume_url: string | null;
  profile_picture_url: string | null;
  skills: Array<{ skill_id: string; skill_name: string; skill_color: string }>;
}

interface SkillSuggestion {
  id: string;
  name: string;
  color: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<SkillSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedColor, setSelectedColor] = useState<SkillColor>("gray");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingSkills, setPendingSkills] = useState<Array<{ name: string; color: string }>>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      return;
    }

    // Redirect if not authenticated
    if (status === "unauthenticated" || !session?.user?.id) {
      router.push("/login");
      return;
    }

    fetchProfile();
  }, [session, status, router]);

  // Debounced skill search
  useEffect(() => {
    if (newSkill.trim().length < 2) {
      setSkillSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await userApi.get(`/api/skills?q=${newSkill.trim()}`);
        setSkillSuggestions(response.data || []);
        setShowSuggestions(true);
      } catch (error) {
        setSkillSuggestions([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [newSkill]);

  const fetchProfile = async () => {
    try {
      const response = await userApi.get(`/api/users/${session?.user?.id}`);
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        phone: response.data.phone || "",
        bio: response.data.bio || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userApi.put(`/api/users/${session?.user?.id}`, formData);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async () => {
    // Handle both typed input and pending skills
    const typedSkill = newSkill.trim();
    const skillsToAdd = [...pendingSkills];
    
    // Add typed skill if exists and not already in pending
    if (typedSkill) {
      const exists = skillsToAdd.some(s => s.name.toLowerCase() === typedSkill.toLowerCase());
      if (!exists) {
        skillsToAdd.push({ name: typedSkill, color: "gray" });
      }
    }

    if (skillsToAdd.length === 0) return;

    // Check for duplicates with existing profile skills
    const duplicates = skillsToAdd.filter(skill => 
      profile?.skills?.some(s => s.skill_name.toLowerCase() === skill.name.toLowerCase())
    );

    if (duplicates.length > 0) {
      toast.error(`${duplicates[0].name} already added`);
      return;
    }

    try {
      // Add all skills at once
      await userApi.post(`/api/users/${session?.user?.id}/skills`, {
        skills: skillsToAdd.map(s => s.name),
      });
      
      toast.success(`Added ${skillsToAdd.length} skill${skillsToAdd.length > 1 ? 's' : ''}`);
      
      // Clear pending and input
      setPendingSkills([]);
      setNewSkill("");
      setShowSuggestions(false);
      
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add skills");
    }
  };

  const handleSelectSkill = (skillName: string, color: string) => {
    // Check if already in pending or profile
    const existsInPending = pendingSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
    const existsInProfile = profile?.skills?.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase());
    
    if (existsInPending || existsInProfile) {
      toast.error("Skill already selected");
      return;
    }

    // Add to pending (staging area)
    setPendingSkills(prev => [...prev, { name: skillName, color }]);
    setNewSkill("");
    setShowSuggestions(false);
  };

  const handleRemovePendingSkill = (skillName: string) => {
    setPendingSkills(prev => prev.filter(s => s.name !== skillName));
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      await userApi.delete(`/api/users/${session?.user?.id}/skills/${skillId}`);
      toast.success("Skill removed");
      await fetchProfile();
    } catch (error) {
      toast.error("Failed to remove skill");
    }
  };

  const handleFileUpload = async (type: "resume" | "profile-pic", file: File) => {
    const formData = new FormData();
    formData.append(type === "resume" ? "resume" : "profile_pic", file);

    try {
      const endpoint = type === "resume" ? "/api/users/upload-resume" : "/api/users/upload-profile-pic";
      await userApi.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${type === "resume" ? "Resume" : "Profile picture"} uploaded successfully`);
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Upload failed");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information, skills, and resume
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - User Card & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <CardContent className="pt-0 relative">
                <div className="flex justify-center -mt-16 mb-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden">
                      {profile.profile_picture_url ? (
                        <img
                          src={profile.profile_picture_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-muted-foreground">
                          {profile.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <label htmlFor="photo-upload-overlay" className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                        <Upload className="h-6 w-6" />
                        <input
                          id="photo-upload-overlay"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload("profile-pic", file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  {profile.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
                  <div>
                    <div className="text-2xl font-bold">{profile.skills?.length || 0}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Skills</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{profile.resume_url ? "1" : "0"}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Resume</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">Email</Label>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase">Phone</Label>
                  <p className="font-medium">{profile.phone || "Not provided"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs/Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* About / Edit Form */}
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
                <CardDescription>Tell recruiters who you are</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about your experience and goals..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.bio || "No bio provided yet. Click 'Edit Profile' to add one."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Skills & Expertise</CardTitle>
                  <CardDescription>Showcase your technical abilities</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Skill Input Area */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                    <div className="relative">
                      <div className="flex gap-2">
                         <div className="relative flex-1">
                          <Input
                            placeholder="Add a new skill (e.g. React, Python)..."
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                            className="bg-background"
                          />
                          {showSuggestions && skillSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-lg max-h-60 overflow-auto">
                              {skillSuggestions.map((suggestion) => (
                                <div
                                  key={suggestion.id}
                                  className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2 text-sm"
                                  onClick={() => handleSelectSkill(suggestion.name, suggestion.color)}
                                >
                                  {suggestion.name}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button onClick={handleAddSkill} disabled={!newSkill.trim() && pendingSkills.length === 0}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pending Skills */}
                    {pendingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {pendingSkills.map((skill, index) => {
                           const colorClasses = getSkillColorClasses(skill.color);
                           return (
                             <Badge key={`pending-${index}`} variant="secondary" className={`${colorClasses.bg} ${colorClasses.text} border-dashed border border-current opacity-70`}>
                               {skill.name}
                               <button onClick={() => handleRemovePendingSkill(skill.name)} className="ml-1 hover:text-destructive">
                                 <X className="h-3 w-3" />
                               </button>
                             </Badge>
                           );
                        })}
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={handleAddSkill}>Save All</Button>
                      </div>
                    )}
                  </div>

                  {/* Skills List */}
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => {
                        const colorClasses = getSkillColorClasses(skill.skill_color);
                        return (
                          <div
                            key={skill.skill_id}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all hover:scale-105 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
                          >
                            {skill.skill_name}
                            <button
                              onClick={() => handleRemoveSkill(skill.skill_id)}
                              className="hover:opacity-70 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                      No skills added yet. Start typing to add some!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resume Section */}
            <Card>
              <CardHeader>
                <CardTitle>Resume</CardTitle>
                <CardDescription>Upload your CV to apply for jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                  {profile.resume_url ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Resume Uploaded</h3>
                        <p className="text-sm text-muted-foreground mb-4">You're ready to apply!</p>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" asChild>
                            <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">View Resume</a>
                          </Button>
                          <label htmlFor="resume-reupload">
                            <Button variant="default" asChild>
                              <span className="cursor-pointer">Update</span>
                            </Button>
                            <input
                              id="resume-reupload"
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload("resume", file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Upload Resume</h3>
                        <p className="text-sm text-muted-foreground mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                        <label htmlFor="resume-upload-new">
                          <Button asChild>
                            <span className="cursor-pointer">Select File</span>
                          </Button>
                          <input
                            id="resume-upload-new"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload("resume", file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
