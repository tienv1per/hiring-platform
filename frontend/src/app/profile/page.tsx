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
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your personal information and skills
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Read-only)</Label>
                  <Input id="email" value={profile.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: profile.name || "",
                      phone: profile.phone || "",
                      bio: profile.bio || "",
                    });
                  }}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                )}
                {profile.bio && (
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add skills to showcase your expertise</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Staged Skills - Show skills ready to be added */}
            {pendingSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Ready to add ({pendingSkills.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {pendingSkills.map((skill, index) => {
                    const colorClasses = getSkillColorClasses(skill.color);
                    return (
                      <div
                        key={`pending-${index}`}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
                      >
                        {skill.name}
                        <button
                          onClick={() => handleRemovePendingSkill(skill.name)}
                          className="hover:opacity-70 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add Skill */}
            <div className="relative mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a skill (e.g., JavaScript, React, Python)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  onFocus={() => newSkill.trim().length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <Button 
                  onClick={() => handleAddSkill()}
                  disabled={pendingSkills.length === 0 && !newSkill.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {pendingSkills.length > 0 && `(${pendingSkills.length})`}
                </Button>
              </div>

              {/* Autocomplete Suggestions */}
              {showSuggestions && skillSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                  {skillSuggestions.map((suggestion) => {
                    const colorClasses = getSkillColorClasses(suggestion.color);
                    return (
                      <div
                        key={suggestion.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                        onClick={() => handleSelectSkill(suggestion.name, suggestion.color)}
                      >
                        <span className={`px-2 py-1 rounded text-xs font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                          {suggestion.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Skills List - Colored Badges */}
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => {
                  const colorClasses = getSkillColorClasses(skill.skill_color);
                  return (
                    <div
                      key={skill.skill_id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
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
              <p className="text-gray-500 text-sm">No skills added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Files Card */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Upload your resume and profile picture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume */}
            <div>
              <Label>Resume</Label>
              <div className="flex items-center gap-3 mt-2">
                {profile.resume_url ? (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Current Resume
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No resume uploaded</p>
                )}
                <label htmlFor="resume-upload">
                  <Button asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </span>
                  </Button>
                  <input
                    id="resume-upload"
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
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (max 5MB)</p>
            </div>

            {/* Profile Picture */}
            <div>
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-3 mt-2">
                {profile.profile_picture_url && (
                  <img
                    src={profile.profile_picture_url}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <label htmlFor="photo-upload">
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      {profile.profile_picture_url ? "Change Photo" : "Upload Photo"}
                    </span>
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload("profile-pic", file);
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 2MB)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
