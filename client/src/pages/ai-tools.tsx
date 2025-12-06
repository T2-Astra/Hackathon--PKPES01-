import { motion } from "framer-motion";
import { Sparkles, Wand2, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ContentSummarizer from "@/components/ai/ContentSummarizer";

export default function AITools() {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 md:pl-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Content Summarizer</h1>
              <p className="text-sm text-muted-foreground">
                AI-powered document analysis and summarization
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 text-xs px-3 py-1">
            <Brain className="w-3.5 h-3.5" />
            Gemini AI
          </Badge>
        </motion.div>

        {/* Content Summarizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ContentSummarizer />
        </motion.div>
      </div>
    </div>
  );
}
