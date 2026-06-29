"use client";

import Image from "next/image";
import { PublicLesson } from "@/types/course";

interface LessonViewerProps {
  lesson: PublicLesson;
}

export function LessonViewer({ lesson }: LessonViewerProps) {
  return (
    <div className="animate-fade-in w-full">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">{lesson.title}</h2>

      {lesson.type === "video" && lesson.mediaUrl && (
        <div className="media-frame mb-6 bg-black">
          <video src={lesson.mediaUrl} controls playsInline className="w-full" />
        </div>
      )}

      {lesson.type === "audio" && lesson.mediaUrl && (
        <div className="media-frame mb-6 p-6">
          <audio src={lesson.mediaUrl} controls className="w-full" />
        </div>
      )}

      {lesson.type === "image" && lesson.mediaUrl && (
        <div className="media-frame relative mx-auto mb-6 max-w-2xl p-2">
          <Image
            src={lesson.mediaUrl}
            alt={lesson.mediaCaption ?? lesson.title}
            width={800}
            height={500}
            className="mx-auto rounded-lg object-contain"
            unoptimized
          />
          {lesson.mediaCaption && (
            <p className="mt-2 text-center text-sm text-slate-500">{lesson.mediaCaption}</p>
          )}
        </div>
      )}

      {lesson.content && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
          {lesson.content}
        </div>
      )}
    </div>
  );
}
