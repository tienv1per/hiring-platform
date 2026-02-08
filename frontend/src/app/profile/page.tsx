"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { userApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, X, Upload, Brain, Sparkles, Target, FileText, CheckCircle2, TrendingUp, Shield, Zap } from "lucide-react";
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
    if (status === "loading") return;
    if (status === "unauthenticated" || !session?.user?.id) {
      router.push("/login");
      return;
    }
    fetchProfile();
  }, [session, status, router]);

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
    }, 300);

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
    const typedSkill = newSkill.trim();
    const skillsToAdd = [...pendingSkills];

    if (typedSkill) {
      const exists = skillsToAdd.some(s => s.name.toLowerCase() === typedSkill.toLowerCase());
      if (!exists) {
        skillsToAdd.push({ name: typedSkill, color: "gray" });
      }
    }

    if (skillsToAdd.length === 0) return;

    const duplicates = skillsToAdd.filter(skill =>
      profile?.skills?.some(s => s.skill_name.toLowerCase() === skill.name.toLowerCase())
    );

    if (duplicates.length > 0) {
      toast.error(`${duplicates[0].name} already added`);
      return;
    }

    try {
      await userApi.post(`/api/users/${session?.user?.id}/skills`, {
        skills: skillsToAdd.map(s => s.name),
      });

      toast.success(`Added ${skillsToAdd.length} skill${skillsToAdd.length > 1 ? 's' : ''}`);
      setPendingSkills([]);
      setNewSkill("");
      setShowSuggestions(false);
      await fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add skills");
    }
  };

  const handleSelectSkill = (skillName: string, color: string) => {
    const existsInPending = pendingSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
    const existsInProfile = profile?.skills?.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase());

    if (existsInPending || existsInProfile) {
      toast.error("Skill already selected");
      return;
    }

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

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.name) score += 20;
    if (profile.bio) score += 20;
    if (profile.phone) score += 10;
    if (profile.resume_url) score += 25;
    if (profile.skills && profile.skills.length >= 3) score += 25;
    return score;
  };

  const completeness = calculateCompleteness();

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-indigo-500/50 border-t-indigo-500 animate-spin" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-16">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm mb-4">
                <Brain className="w-4 h-4" />
                <span>AI-Optimized Profile</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage your professional identity and let AI match you with perfect opportunities.
              </p>
            </motion.div>
            {!isEditing && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-11 px-6"
                >
                  Edit Profile
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Profile Card & AI Insights */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                <CardContent className="pt-0 relative">
                  <div className="flex justify-center -mt-14 mb-4">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full border-4 border-white dark:border-[#030711] bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                        {profile.profile_picture_url ? (
                          <img
                            src={profile.profile_picture_url}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                            {profile.name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {isEditing && (
                        <label
                          htmlFor="photo-upload-overlay"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                        >
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
                    <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                    {profile.phone && <p className="text-sm text-gray-400 dark:text-gray-500">{profile.phone}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center border-t border-gray-100 dark:border-white/10 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{profile.skills?.length || 0}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Skills</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.resume_url ? "1" : "0"}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Resume</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Profile Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Profile Strength</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">AI-calculated score</p>
                    </div>
                  </div>
                  
                  {/* Progress Ring */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200 dark:text-white/10" />
                        <circle
                          cx="40" cy="40" r="35"
                          stroke="url(#gradient)"
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${completeness * 2.2} 220`}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{completeness}%</span>
                      </div>
                    </div>
                    <div className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${profile.name ? 'text-green-500' : 'text-gray-300'}`} />
                        Name added
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${profile.bio ? 'text-green-500' : 'text-gray-300'}`} />
                        Bio completed
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${profile.resume_url ? 'text-green-500' : 'text-gray-300'}`} />
                        Resume uploaded
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${(profile.skills?.length || 0) >= 3 ? 'text-green-500' : 'text-gray-300'}`} />
                        3+ skills added
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 uppercase">Email</Label>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500 uppercase">Phone</Label>
                    <p className="font-medium">{profile.phone || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Content Areas */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* About Me */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    About Me
                  </CardTitle>
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
                            className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl"
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
                          className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-xl"
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl border-gray-300 dark:border-white/10">Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {profile.bio || "No bio provided yet. Click 'Edit Profile' to add one."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Skills & Expertise
                  </CardTitle>
                  <CardDescription>AI uses these to match you with relevant jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Skill Input */}
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 space-y-4">
                      <div className="relative">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Add a skill (e.g. React, Python)..."
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                              className="bg-white dark:bg-[#030711] border-gray-200 dark:border-white/10 rounded-xl"
                            />
                            {showSuggestions && skillSuggestions.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#0A0F1C] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-auto">
                                {skillSuggestions.map((suggestion) => (
                                  <div
                                    key={suggestion.id}
                                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer flex items-center gap-2 text-sm"
                                    onClick={() => handleSelectSkill(suggestion.name, suggestion.color)}
                                  >
                                    {suggestion.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button onClick={handleAddSkill} disabled={!newSkill.trim() && pendingSkills.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl">
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
                              <Badge key={`pending-${index}`} variant="secondary" className={`${colorClasses.bg} ${colorClasses.text} border-dashed border border-current opacity-70 rounded-lg px-3 py-1`}>
                                {skill.name}
                                <button onClick={() => handleRemovePendingSkill(skill.name)} className="ml-1 hover:text-red-500">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            );
                          })}
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-indigo-600 dark:text-indigo-400" onClick={handleAddSkill}>Save All</Button>
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
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:scale-105 ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}
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
                      <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                        No skills added yet. Start typing to add some!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resume Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Resume
                  </CardTitle>
                  <CardDescription>AI analyzes your resume for better job matching</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    {profile.resume_url ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Resume Uploaded</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">AI is analyzing your skills...</p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" asChild className="rounded-xl border-gray-300 dark:border-white/10">
                              <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">View Resume</a>
                            </Button>
                            <label htmlFor="resume-reupload">
                              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl" asChild>
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
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">Upload Resume</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">PDF, DOC, DOCX (Max 5MB)</p>
                          <label htmlFor="resume-upload-new">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl" asChild>
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
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
