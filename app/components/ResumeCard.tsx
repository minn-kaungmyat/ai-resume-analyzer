import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        const imageBlob = await fs.read(imagePath);
        if (imageBlob) {
          const imgBlob = new Blob([imageBlob], { type: "image/png" });
          const url = URL.createObjectURL(imgBlob);
          setImageUrl(url);
        }
      } catch (error) {
        console.error("Failed to load image:", error);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imagePath, fs]);

  return (
    <Link to={`/resume/${id}`} className="resume-card animate-fade-in">
      <div className="resume-card-header">
        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-lg font-bold text-charcoal">{companyName}</h3>
          <p className="text-sm text-muted">{jobTitle}</p>
        </div>
        <ScoreCircle score={feedback.overallScore} />
      </div>
      <div className="border border-border rounded-xl overflow-hidden bg-slate/5">
        {loading ? (
          <div className="w-full h-[280px] bg-bg flex items-center justify-center">
            <p className="text-muted">Loading preview...</p>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="resume preview"
            className="w-full h-[280px] object-cover object-top"
          />
        )}
      </div>
    </Link>
  );
};

export default ResumeCard;
