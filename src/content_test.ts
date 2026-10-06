import { lessonForSubscriber } from "./creator_service";

const educatorLesson = lessonForSubscriber("teacher@school.edu");
if (educatorLesson !== "Teaching a paid workshop") throw new Error(`unexpected lesson: ${educatorLesson}`);
const publicLesson = lessonForSubscriber("maker@example.com");
if (publicLesson !== "Your first creator lesson") throw new Error(`unexpected lesson: ${publicLesson}`);
console.log("lesson routing passed");
