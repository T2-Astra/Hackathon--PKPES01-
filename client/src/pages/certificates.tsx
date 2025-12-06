import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Search,
  Download,
  Share2,
  Calendar,
  CheckCircle2,
  Filter,
} from "lucide-react";
import CertificateCard, {
  CertificatePreview,
} from "@/components/certificates/CertificateCard";
import { useAuth } from "@/hooks/useAuthContext";

interface Certificate {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  category?: string;
  skillName?: string;
  score?: number;
  issueDate: Date;
  verificationCode: string;
  isPublic: boolean;
}

export default function Certificates() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch certificates from API
  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["/api/certificates"],
    queryFn: async () => {
      const res = await fetch("/api/certificates", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const filteredCertificates = certificates.filter(
    (cert: Certificate) =>
      cert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.skillName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const excellenceCount = certificates.filter(
    (c: Certificate) => c.score && c.score >= 90
  ).length;
  const publicCount = certificates.filter(
    (c: Certificate) => c.isPublic
  ).length;

  const handleView = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsPreviewOpen(true);
  };

  const handleDownload = (cert: Certificate) => {
    console.log("Download certificate:", cert._id || cert.id);
  };

  const handleShare = (cert: Certificate) => {
    const shareUrl = `${window.location.origin}/verify/${cert.verificationCode}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Share URL copied to clipboard!");
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Award className="w-8 h-8 text-primary" />
              Certificates
            </h1>
            <p className="text-muted-foreground mt-1">
              Your earned credentials and achievements
            </p>
          </div>

        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{certificates.length}</p>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <CheckCircle2 className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{excellenceCount}</p>
                  <p className="text-sm text-muted-foreground">
                    With Excellence
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Share2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publicCount}</p>
                  <p className="text-sm text-muted-foreground">Public</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Date().getFullYear()}
                  </p>
                  <p className="text-sm text-muted-foreground">Latest Year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          /* Certificates Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map((cert: Certificate) => (
              <CertificateCard
                key={cert._id || cert.id}
                id={cert._id || cert.id || ""}
                title={cert.title}
                description={cert.description}
                category={cert.category}
                skillName={cert.skillName}
                score={cert.score}
                issueDate={new Date(cert.issueDate)}
                verificationCode={cert.verificationCode}
                isPublic={cert.isPublic}
                onView={() => handleView(cert)}
                onDownload={() => handleDownload(cert)}
                onShare={() => handleShare(cert)}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredCertificates.length === 0 && (
          <Card className="p-8 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete learning paths and assessments to earn certificates
            </p>
            <Button>Browse Learning Paths</Button>
          </Card>
        )}

        {/* Certificate Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            {selectedCertificate && (
              <div className="space-y-4">
                <CertificatePreview
                  title={selectedCertificate.title}
                  recipientName={`${user?.firstName || "Learner"} ${user?.lastName || ""}`}
                  issueDate={new Date(selectedCertificate.issueDate)}
                  score={selectedCertificate.score}
                  verificationCode={selectedCertificate.verificationCode}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleShare(selectedCertificate)}
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={() => handleDownload(selectedCertificate)}
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
