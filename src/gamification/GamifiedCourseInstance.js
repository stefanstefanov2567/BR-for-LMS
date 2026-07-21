// Разширява затворения модел CourseInstance

class GamifiedCourseInstance {
  /**
   * @param {Object} instanceDoc - Оригиналният Mongoose документ CourseInstance
   */
  constructor(instanceDoc) {
    this.instance = instanceDoc;
    
    // Геймификационни константи
    this.BASE_LESSON_XP = 20;
    this.EARLY_BIRD_MULTIPLIER = 1.5;
    this.BINGE_LEARNER_BONUS = 50;
    this.COMPLETIONIST_BONUS = 200;
  }

  /**
   * Feature 1 & 2: Изчислява колко XP получава потребител за завършен урок
   * @param {string} lessonId - ID на завършения урок
   * @param {string} userId - ID на потребителя
   * @returns {number} Спечелени точки
   */
  calculateLessonXP(lessonId, userId) {
    let earnedXP = this.BASE_LESSON_XP;
    
    // Намираме конкретния урок и секция в curriculum-a
    let targetLesson = null;
    let sectionEndDate = null;

    for (const section of this.instance.curriculum) {
      const found = section.lessons.find(l => l._id.toString() === lessonId.toString());
      if (found) {
        targetLesson = found;
        sectionEndDate = section.endDateTime;
        break;
      }
    }

    if (!targetLesson) return 0; // Урокът не е намерен

    // Намираме кога точно потребителят го е завършил
    const completionRecord = targetLesson.completedBy.find(
      record => record.user.toString() === userId.toString()
    );

    if (!completionRecord) return 0; // Не го е завършил

    const completedAt = new Date(completionRecord.completedAt);

    // Логика за Live курсове: Early Bird Bonus
    if (this.instance.isLive && sectionEndDate) {
      const deadline = new Date(sectionEndDate);
      const hoursDifference = (completedAt - deadline) / (1000 * 60 * 60);
      
      // Ако е завършено до 24 часа след края на секцията
      if (hoursDifference <= 24 && hoursDifference >= 0) {
        earnedXP *= this.EARLY_BIRD_MULTIPLIER;
      }
    }

    return Math.round(earnedXP);
  }

  /**
   * Feature 3: Проверява дали потребителят е "Completionist" (завършил е всичко 100%)
   * @param {string} userId - ID на потребителя
   * @returns {boolean}
   */
  isCompletionist(userId) {
    if (!this.instance.curriculum || this.instance.curriculum.length === 0) {
      return false;
    }

    for (const section of this.instance.curriculum) {
      for (const lesson of section.lessons) {
        const hasCompleted = lesson.completedBy.some(
          record => record.user.toString() === userId.toString()
        );
        if (!hasCompleted) {
          return false; // Намерен е незавършен урок
        }
      }
    }

    return true; // Всички уроци са завършени
  }
}

export default GamifiedCourseInstance;
