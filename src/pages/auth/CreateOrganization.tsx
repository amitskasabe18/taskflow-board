import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Building2,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const CreateOrganization = () => {
  const [accountType, setAccountType] = useState<"organization" | "individual" | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [userType, setUserType] = useState<"private" | "governmental" | "other">("private");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- THEME FIX (system preference) ---------------- */
  useEffect(() => {
    const root = window.document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);
  /* --------------------------------------------------------------- */

  useEffect(() => {
    // Check if user is coming from OTP verification
    if (!location.state?.verified || !location.state?.email) {
      toast.error("Please verify your OTP first");
      navigate("/auth/send-otp");
      return;
    }
    setEmail(location.state.email);
  }, [location.state, navigate]);

  const validateForm = () => {
    const errors = [];

    if (!name.trim()) errors.push("Organization name is required");
    if (!userType) errors.push("Organization type is required");

    // Validate URL format if provided
    if (websiteUrl) {
      try {
        new URL(websiteUrl);
      } catch {
        errors.push("Please enter a valid website URL");
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/api/v1/organisations/create-for-signup", {
        name: name.trim(),
        description: description.trim() || null,
        user_type: userType,
        website_url: websiteUrl.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || null,
        postal_code: postalCode.trim() || null,
      });

      if (response.data.success) {
        toast.success("Organization created successfully!");
        // Navigate to register page with organization UUID and email
        navigate("/auth/register", {
          state: {
            verified: true,
            email: email,
            organisationUuid: response.data.data.organisation.uuid,
            organisationName: response.data.data.organisation.name,
          },
        });
      } else {
        toast.error(response.data.message || "Failed to create organization");
      }
    } catch (error: any) {
      console.error("Organization creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create organization. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/auth/verify-otp", { state: { email } });
  };

  const handleSkip = () => {
    // Skip organization creation and go directly to registration
    navigate("/auth/register", {
      state: {
        verified: true,
        email: email,
        skipOrganization: true,
      },
    });
  };

  const handleAccountTypeSelect = (type: "organization" | "individual") => {
    setAccountType(type);
    if (type === "individual") {
      navigate("/auth/register", {
        state: {
          verified: true,
          email: email,
          skipOrganization: true,
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center relative overflow-hidden p-6">
      {/* Interesting background: subtle dot grid + floating geometric shapes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${
            document.documentElement.classList.contains("dark")
              ? "rgba(255,255,255,0.03) 1px, transparent 1px"
              : "rgba(0,0,0,0.03) 1px, transparent 1px"
          })`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating shapes – no blur, just subtle color with opacity */}
      <div className="absolute top-[15%] left-[10%] w-32 h-32 border border-indigo-200/20 dark:border-indigo-500/10 rotate-12 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-40 h-40 border border-purple-200/20 dark:border-purple-500/10 -rotate-6 rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[25%] w-24 h-24 border border-emerald-200/20 dark:border-emerald-500/10 rotate-45 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[20%] w-36 h-36 border border-amber-200/20 dark:border-amber-500/10 -rotate-12 rounded-3xl pointer-events-none" />

      {/* Main card */}
      <Card className="relative z-10 w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Building2 className="h-6 w-6" />
            Choose Your Account Type
          </CardTitle>
          <CardDescription>
            Select how you want to register - as an organization or as an individual user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Account Type Selection - only show if no type selected */}
          {!accountType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Organization Account */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                  accountType === "organization"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
                onClick={() => handleAccountTypeSelect("organization")}
              >
                <CardContent className="p-6 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Organization Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create an organization to manage teams, projects, and collaborate with multiple
                    users
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Multiple user management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Team collaboration</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Advanced project features</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant={accountType === "organization" ? "default" : "outline"}
                    onClick={() => handleAccountTypeSelect("organization")}
                  >
                    Choose Organization
                  </Button>
                </CardContent>
              </Card>

              {/* Individual Account */}
              <Card
                className={`cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                  accountType === "individual"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border/80"
                }`}
                onClick={() => handleAccountTypeSelect("individual")}
              >
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Individual Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Register as an individual user to join organizations and work on projects
                  </p>
                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Quick setup</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Join existing teams</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Personal workspace</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    variant={accountType === "individual" ? "default" : "outline"}
                    onClick={() => handleAccountTypeSelect("individual")}
                  >
                    Choose Individual
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Organization Form (only shown when organization is selected) */}
          {accountType === "organization" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Acme Corporation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your organization"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userType">Organization Type *</Label>
                  <Select
                    value={userType}
                    onValueChange={(value: "private" | "governmental" | "other") =>
                      setUserType(value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="governmental">Governmental</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information (Optional)</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder="San Francisco"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="California"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      placeholder="94102"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Building2 className="mr-2 h-4 w-4" />
                        Create Organization & Continue
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Back Button (shown when individual is selected) */}
          {accountType === "individual" && (
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Previous Step
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrganization;