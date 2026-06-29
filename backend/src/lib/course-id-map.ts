import mongoose from "mongoose";

export function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id) && !String(id).startsWith("new-");
}

/** Map client lesson ids (including temp `new-N`) to MongoDB ObjectIds when saving. */
export function buildLessonIdMap(
  lessons: { id?: string }[],
): Map<string, mongoose.Types.ObjectId> {
  const map = new Map<string, mongoose.Types.ObjectId>();
  lessons.forEach((l, idx) => {
    const _id =
      l.id && isValidObjectId(l.id)
        ? new mongoose.Types.ObjectId(l.id)
        : new mongoose.Types.ObjectId();
    if (l.id) map.set(l.id, _id);
    map.set(`idx-${idx}`, _id);
  });
  return map;
}

export function resolveLessonObjectId(
  lessonId: string | undefined,
  map: Map<string, mongoose.Types.ObjectId>,
): mongoose.Types.ObjectId | undefined {
  if (!lessonId) return undefined;
  return map.get(lessonId);
}
