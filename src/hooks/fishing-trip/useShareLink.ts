
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export function useShareLink(currentTripId: string) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Update share URL whenever currentTripId changes
  useEffect(() => {
    if (currentTripId) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/trip/${currentTripId}`);
    }
  }, [currentTripId]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "Link da pescaria copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    shareUrl,
    copied,
    copyShareLink
  };
}
